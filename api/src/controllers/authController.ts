import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, IUser } from '../models/user';
import crypto from 'crypto';
import { AnyRequestHandler } from '../types/express';

/**
 * Armazenamento temporário de refresh tokens
 * @note Em ambiente de produção, estes tokens devem ser armazenados em banco de dados
 */
const refreshTokens: Map<string, { userId: string, expiresAt: Date }> = new Map();

/**
 * Schemas de validação para operações de autenticação
 */

// Schema para registro de usuário
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.enum(['user', 'admin']).optional(),
  properties: z.array(z.string()).optional()
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

/**
 * Configuração de duração dos tokens
 */
const ACCESS_TOKEN_EXPIRY = '4h'; // Token de acesso válido por 4 horas
const REFRESH_TOKEN_EXPIRY = '7d'; // Token de atualização válido por 7 dias

/**
 * Gera um novo par de tokens de autenticação
 * @param user - Objeto do usuário autenticado
 * @returns Objeto contendo accessToken e refreshToken
 */
const generateTokens = (user: IUser) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido');
  }
  
  // Incluir as propriedades do usuário no token para acesso mais fácil
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role,
      name: user.name,
      properties: user.properties
    }, 
    jwtSecret, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  refreshTokens.set(refreshToken, {
    userId: user._id.toString(),
    expiresAt
  });
  
  return { accessToken, refreshToken };
};

/**
 * Registra um novo usuário no sistema
 * @route POST /api/auth/register
 * @param req.body - Dados do usuário (email, senha, nome, papel, propriedades)
 * @returns Objeto com mensagem de sucesso e dados do usuário criado
 */
export const register: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ 
        error: 'Dados de registro inválidos',
        details: parseResult.error.format()
      });
      return;
    }
    
    const { email, password, name, role = 'user', properties = [] } = parseResult.data;
    
    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ 
        error: 'Usuário já existe',
        code: 'USER_EXISTS'
      });
      return;
    }
    
    // Se o role for 'user', assegure que tenha pelo menos uma propriedade associada
    // Se não tiver nenhuma propriedade especificada, associe à 'fazenda-brilhante' por padrão
    const userProperties = role === 'user' && properties.length === 0 
      ? ['fazenda-brilhante'] 
      : properties;
    
    // Se for admin, não precisa ter propriedades associadas
    const finalProperties = role === 'admin' ? [] : userProperties;
    
    // Cria o novo usuário
    const newUser = new User({
      email,
      password,
      name,
      role,
      properties: finalProperties
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        properties: newUser.properties
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Autentica um usuário e gera tokens de acesso
 * @route POST /api/auth/login
 * @param req.body - Credenciais do usuário (email, senha)
 * @returns Tokens de acesso e dados do usuário autenticado
 */
export const login: AnyRequestHandler = async (req, res, next) => {
  try {
    console.log('Tentativa de login:', req.body.email);
    
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.log('Dados de login inválidos:', parseResult.error.format());
      res.status(400).json({ 
        error: 'Dados de login inválidos',
        message: 'Por favor, forneça email e senha válidos',
        details: parseResult.error.format()
      });
      return;
    }
    
    const { email, password } = parseResult.data;
    
    // Busca o usuário
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    // Verifica a senha
    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      console.log('Senha inválida para usuário:', email);
      res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    try {
      console.log('Login bem-sucedido para:', email, 'Papel:', user.role, 'Propriedades:', user.properties);
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Configurar cookies para autenticação alternativa
      res.cookie('authToken', accessToken, {
        httpOnly: false, // Precisa ser acessível pelo JavaScript do cliente
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/'
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh'
      });
      
      res.json({ 
        accessToken, 
        refreshToken, 
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          properties: user.properties
        }
      });
    } catch (error) {
      console.error('Erro ao gerar tokens:', error);
      res.status(500).json({ 
        error: 'Erro ao processar login',
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  } catch (error) {
    console.error('Erro não tratado no login:', error);
    next(error);
  }
};

/**
 * Renova o token de acesso usando um refresh token válido
 * @route POST /api/auth/refresh
 * @param req.body.refreshToken - Token de atualização
 * @returns Novo token de acesso
 */
export const refreshToken: AnyRequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({ 
        error: 'Refresh token não fornecido',
        code: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }
    
    const tokenData = refreshTokens.get(refreshToken);
    if (!tokenData) {
      res.status(401).json({ 
        error: 'Refresh token inválido',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }
    
    if (tokenData.expiresAt < new Date()) {
      refreshTokens.delete(refreshToken);
      res.status(401).json({ 
        error: 'Refresh token expirado',
        code: 'EXPIRED_REFRESH_TOKEN'
      });
      return;
    }
    
    const user = await User.findById(tokenData.userId);
    if (!user) {
      refreshTokens.delete(refreshToken);
      res.status(401).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    try {
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      
      refreshTokens.delete(refreshToken);
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh'
      });
      
      res.json({ 
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Erro ao renovar tokens:', error);
      res.status(500).json({ 
        error: 'Erro ao processar renovação de token',
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Retorna informações do usuário autenticado
 * @route GET /api/auth/me
 * @requires Autenticação
 * @returns Dados do usuário atual
 */
export const getCurrentUser: AnyRequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    res.json({
      user: {
        id: req.user.id, // Usando id em vez de _id
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        properties: req.user.properties
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invalida o refresh token do usuário, realizando o logout
 * @route POST /api/auth/logout
 * @requires Autenticação
 * @param req.body.refreshToken - Token de atualização a ser invalidado
 * @returns Mensagem de confirmação
 */
export const logout: AnyRequestHandler = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh'
    });
    
    res.json({ 
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista todos os usuários cadastrados no sistema
 * @route GET /api/auth/users
 * @requires Autenticação de administrador
 * @returns Lista de usuários
 */
export const listUsers: AnyRequestHandler = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 });
    
    // Transformar os documentos para garantir que o ID seja retornado corretamente
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      properties: user.properties
    }));
    
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    next(error);
  }
};

/**
 * Schema de validação para atualização de usuário
 */
const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['user', 'admin']).optional(),
  properties: z.array(z.string()).optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional()
});

/**
 * Atualiza dados de um usuário existente
 * @route PUT /api/auth/users/:id
 * @requires Autenticação de administrador
 * @param req.params.id - ID do usuário a ser atualizado
 * @param req.body - Novos dados do usuário
 * @returns Dados atualizados do usuário
 */
export const updateUser: AnyRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar o ID antes de prosseguir
    if (!id || id === 'undefined') {
      return res.status(400).json({
        error: 'ID de usuário inválido',
        code: 'INVALID_USER_ID'
      });
    }
    
    // Verificar se o usuário existe
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Validar dados de atualização
    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Dados de atualização inválidos',
        details: parseResult.error.format()
      });
    }
    
    const updateData = parseResult.data;
    
    // Se o papel for alterado para admin, remover propriedades
    if (updateData.role === 'admin') {
      updateData.properties = [];
    }
    
    // Se o papel for alterado para user e não houver propriedades, adicionar a propriedade padrão
    if (updateData.role === 'user' && (!updateData.properties || updateData.properties.length === 0)) {
      updateData.properties = ['fazenda-brilhante'];
    }
    
    // Atualizar o usuário
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'Erro ao atualizar usuário',
        code: 'UPDATE_FAILED'
      });
    }
    
    // Formatar o usuário atualizado para garantir que o ID seja retornado corretamente
    const formattedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      properties: updatedUser.properties
    };
    
    res.json({ 
      message: 'Usuário atualizado com sucesso',
      user: formattedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    next(error);
  }
};

/**
 * Remove um usuário do sistema
 * @route DELETE /api/auth/users/:id
 * @requires Autenticação de administrador
 * @param req.params.id - ID do usuário a ser removido
 * @returns Mensagem de confirmação
 */
export const deleteUser: AnyRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar o ID antes de prosseguir
    if (!id || id === 'undefined') {
      return res.status(400).json({
        error: 'ID de usuário inválido',
        code: 'INVALID_USER_ID'
      });
    }
    
    console.log('Tentando excluir usuário com ID:', id);
    
    // Verificar se o usuário existe
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Não permitir excluir o próprio usuário
    if (req.user && req.user.id && req.user.id === id) {
      return res.status(400).json({ 
        error: 'Não é possível excluir seu próprio usuário',
        code: 'CANNOT_DELETE_SELF'
      });
    }
    
    // Log para depuração
    console.log('Usuário atual:', req.user);
    
    // Excluir o usuário
    await User.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    next(error);
  }
};
