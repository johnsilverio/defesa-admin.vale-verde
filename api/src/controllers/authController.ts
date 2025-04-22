import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { users, User } from '../models/user';
import crypto from 'crypto';

// Lista local de refresh tokens (em produção, seria armazenada em banco de dados)
const refreshTokens: Map<string, { userId: number, expiresAt: Date }> = new Map();

// Schemas de validação Zod para todas as operações
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().optional(),
  role: z.enum(['user', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Duração dos tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos para o token de acesso
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias para o refresh token

/**
 * Tipo personalizado para handlers de requisição com suporte adequado a tipagem 
 */
type CustomRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

/**
 * Gera um novo par de tokens (access token e refresh token)
 */
const generateTokens = (user: User) => {
  // Verifica se a chave JWT está definida
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido');
  }
  
  // Gera access token com prazo curto
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role,
      name: user.name
    }, 
    jwtSecret, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  // Gera refresh token com prazo mais longo
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // Calcula data de expiração do refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias
  
  // Armazena refresh token (em produção seria no banco de dados)
  refreshTokens.set(refreshToken, {
    userId: user.id,
    expiresAt
  });
  
  return { accessToken, refreshToken };
};

/**
 * Registra um novo usuário
 */
export const register: CustomRequestHandler = async (req, res, next) => {
  try {
    // Valida os dados de entrada
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ 
        error: 'Dados de registro inválidos',
        details: parseResult.error.format()
      });
      return;
    }
    
    const { email, password, name, role = 'user' } = parseResult.data;
    
    // Verifica se o usuário já existe
    if (users.find(u => u.email === email)) {
      res.status(409).json({ 
        error: 'Usuário já existe',
        code: 'USER_EXISTS'
      });
      return;
    }
    
    // Criptografa a senha
    const hash = await bcrypt.hash(password, 12); // Usando fator 12 para maior segurança
    
    // Cria o novo usuário
    const newUser: User = { 
      id: users.length + 1, 
      email, 
      password: hash,
      name,
      role
    };
    
    // Adiciona o usuário (em produção, seria salvo no banco de dados)
    users.push(newUser);
    
    // Responde com sucesso
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Realiza login de um usuário
 */
export const login: CustomRequestHandler = async (req, res, next) => {
  try {
    // Valida os dados de entrada
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
    const user = users.find(u => u.email === email);
    if (!user) {
      res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    let passwordValid = false;
    
    // Ambiente de desenvolvimento - permite senhas em texto puro para facilitar testes
    if (process.env.NODE_ENV !== 'production') {
      // Verifica se a senha é igual (para ambiente de desenvolvimento)
      passwordValid = password === user.password;
      
      // Se não for válida, tenta o método bcrypt como fallback
      if (!passwordValid) {
        passwordValid = await bcrypt.compare(password, user.password);
      }
    } else {
      // Em produção, sempre usar bcrypt
      passwordValid = await bcrypt.compare(password, user.password);
    }
    
    if (!passwordValid) {
      res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    try {
      // Gera tokens
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Define cookies para os tokens
      // O cookie de refresh token deve ser httpOnly para segurança
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/api/auth/refresh' // Restringe o cookie à rota de refresh
      });
      
      // Responde com os tokens e dados do usuário (incluindo propriedades)
      res.json({ 
        accessToken, 
        refreshToken, 
        user: {
          id: user.id,
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
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza o token de acesso usando um refresh token
 */
export const refreshAccessToken: CustomRequestHandler = async (req, res, next) => {
  try {
    // Obtém o refresh token do cookie ou do corpo da requisição
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({ 
        error: 'Refresh token não fornecido',
        code: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }
    
    // Verifica se o refresh token existe
    const tokenData = refreshTokens.get(refreshToken);
    if (!tokenData) {
      res.status(401).json({ 
        error: 'Refresh token inválido',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }
    
    // Verifica se o refresh token expirou
    if (tokenData.expiresAt < new Date()) {
      // Remove o token expirado
      refreshTokens.delete(refreshToken);
      
      res.status(401).json({ 
        error: 'Refresh token expirado',
        code: 'EXPIRED_REFRESH_TOKEN'
      });
      return;
    }
    
    // Busca o usuário
    const user = users.find(u => u.id === tokenData.userId);
    if (!user) {
      // Remove o token se o usuário não existir mais
      refreshTokens.delete(refreshToken);
      
      res.status(401).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    try {
      // Gera novos tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      
      // Remove o refresh token antigo
      refreshTokens.delete(refreshToken);
      
      // Define cookies para os novos tokens
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/api/auth/refresh'
      });
      
      // Responde com os novos tokens
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
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Realiza logout de um usuário
 */
export const logout: CustomRequestHandler = (req, res, next) => {
  try {
    // Obtém o refresh token do cookie ou do corpo da requisição
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    // Se houver um refresh token, remove-o
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    
    // Limpa o cookie de refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh'
    });
    
    // Responde com sucesso
    res.json({ 
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
