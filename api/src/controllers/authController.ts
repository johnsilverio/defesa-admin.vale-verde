import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, IUser } from '../models/user';
import crypto from 'crypto';

// Lista local de refresh tokens (em produção, seria armazenada em banco de dados)
const refreshTokens: Map<string, { userId: string, expiresAt: Date }> = new Map();

// Schemas de validação Zod para todas as operações
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

// Duração dos tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos para o token de acesso
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias para o refresh token

/**
 * Gera um novo par de tokens (access token e refresh token)
 */
const generateTokens = (user: IUser) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido');
  }
  
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role,
      name: user.name
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
 * Registra um novo usuário
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
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
 * Realiza login de um usuário
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ 
        error: 'Dados de login inválidos',
        details: parseResult.error.format()
      });
      return;
    }
    
    const { email, password } = parseResult.data;
    
    // Busca o usuário
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    // Verifica a senha
    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    try {
      const { accessToken, refreshToken } = generateTokens(user);
      
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
    next(error);
  }
};

/**
 * Renovação de token de acesso
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
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
 * Obtém informações do usuário logado
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    res.json({
      user: {
        id: req.user._id,
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
 * Realiza logout de um usuário
 */
export const logout = (req: Request, res: Response, next: NextFunction) => {
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
 * Lista todos os usuários (apenas para administradores)
 */
export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};
