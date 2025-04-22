import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { User } from '../models/user';
import crypto from 'crypto';
import { AnyRequestHandler } from '../types/express';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
  properties?: string[];
}

/**
 * Middleware para autenticação de usuários
 * 
 * Verifica o token JWT fornecido no cabeçalho Authorization ou em cookies
 * e adiciona as informações do usuário ao objeto de requisição
 * 
 * @param req - Objeto de requisição Express
 * @param res - Objeto de resposta Express
 * @param next - Função para passar para o próximo middleware
 */
export const authMiddleware: AnyRequestHandler = async (req, res, next) => {
  try {
    // Obter token do cabeçalho Authorization ou de cookies
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.authToken;
    
    // If no token anywhere, return error
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !tokenFromCookie) {
      return res.status(401).json({ 
        error: 'Não autorizado, token não fornecido', 
        code: 'NO_TOKEN' 
      });
    }

    // Prioritize header token, but accept cookie as fallback
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : tokenFromCookie;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token ausente', 
        code: 'MISSING_TOKEN' 
      });
    }
    
    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('SECURITY ALERT: JWT_SECRET not defined in environment!');
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor', 
        code: 'SERVER_ERROR' 
      });
    }
    
    // Decodificar e verificar o token
    try {
      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      
      // Buscar usuário no banco de dados
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado', 
          code: 'USER_NOT_FOUND' 
        });
      }
      
      // Adicionar usuário ao objeto de requisição
      req.user = user;
      
      // Log access attempt for audit (in production could use a logger)
      if (process.env.NODE_ENV === 'production') {
        console.info(`Authenticated access: ${req.user?.email} (${req.user?.role}) - ${req.method} ${req.originalUrl}`);
      }
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          error: 'Token expirado', 
          code: 'TOKEN_EXPIRED',
          message: 'Sua sessão expirou. Por favor, faça login novamente.'
        });
      }
      
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN',
        message: error instanceof Error ? error.message : 'Erro na verificação do token'
      });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'SERVER_ERROR' 
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 * 
 * Deve ser usado após o middleware de autenticação
 * 
 * @param req - Objeto de requisição Express
 * @param res - Objeto de resposta Express
 * @param next - Função para passar para o próximo middleware
 */
export const adminMiddleware: AnyRequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso', 
      code: 'NOT_ADMIN' 
    });
  }
  next();
};

/**
 * Middleware para autenticação usando JWT.
 * 
 * Implementação alternativa que também verifica cookies.
 * 
 * @param req - Objeto de requisição Express.
 * @param res - Objeto de resposta Express.
 * @param next - Função para passar para o próximo middleware.
 */
export const authenticate: AnyRequestHandler = (req, res, next) => {
  // Obter token do cabeçalho ou de cookies.
  const auth = req.headers.authorization;
  const tokenFromCookie = req.cookies?.authToken;
  
  // Se não houver token, retornar erro.
  if ((!auth || !auth.startsWith('Bearer ')) && !tokenFromCookie) {
    res.status(401).json({ 
      error: 'Autenticação necessária', 
      code: 'MISSING_TOKEN' 
    });
    return;
  }
  
  // Priorizar token do cabeçalho, mas aceitar cookie como fallback.
  const token = auth?.startsWith('Bearer ') 
    ? auth.split(' ')[1] 
    : tokenFromCookie;
  
  if (!token) {
    res.status(401).json({ 
      error: 'Token ausente', 
      code: 'MISSING_TOKEN' 
    });
    return;
  }

  // Obter segredo do JWT, com fallback seguro.
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('SECURITY ALERT: JWT_SECRET not defined in environment!');
    res.status(500).json({ 
      error: 'Erro de configuração do servidor', 
      code: 'SERVER_CONFIGURATION_ERROR' 
    });
    return;
  }
  
  try {
    // Verificar token.
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded as Express.Request['user'];
    
    // Logar tentativa de acesso para auditoria (em produção, poderia usar um logger).
    if (process.env.NODE_ENV === 'production') {
      console.info(`Authenticated access: ${req.user?.email} (${req.user?.role}) - ${req.method} ${req.originalUrl}`);
    }
    
    next();
  } catch (error) {
    // Tratamento específico para tokens expirados.
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expirado', 
        code: 'TOKEN_EXPIRED',
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
      return;
    }
    
    // Outros erros de token.
    res.status(401).json({ 
      error: 'Token inválido', 
      code: 'INVALID_TOKEN',
      message: error instanceof Error ? error.message : 'Erro na verificação do token'
    });
    return;
  }
};

/**
 * Middleware para verificar se o usuário é administrador.
 * 
 * Deve ser usado após o middleware de autenticação.
 * 
 * @param req - Objeto de requisição Express.
 * @param res - Objeto de resposta Express.
 * @param next - Função para passar para o próximo middleware.
 */
export const requireAdmin: AnyRequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ 
      error: 'Usuário não autenticado', 
      code: 'NOT_AUTHENTICATED' 
    });
    return;
  }
  
  if (req.user.role !== 'admin') {
    // Logar tentativa de acesso não autorizada para administrador.
    console.warn(`Unauthorized admin access attempt: ${req.user?.email} - ${req.method} ${req.originalUrl}`);
    
    res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso', 
      code: 'ADMIN_REQUIRED' 
    });
    return;
  }
  
  next();
};

/**
 * Middleware para adicionar token CSRF em todas as respostas.
 * 
 * Previne ataques CSRF (Cross-Site Request Forgery).
 * 
 * @param req - Objeto de requisição Express.
 * @param res - Objeto de resposta Express.
 * @param next - Função para passar para o próximo middleware.
 */
export const csrfProtection: AnyRequestHandler = (req, res, next) => {
  // Gerar um token CSRF único para esta sessão.
  const csrfToken = crypto.randomBytes(16).toString('hex');
  
  // Armazenar no objeto de resposta para ser enviado.
  res.locals.csrfToken = csrfToken;
  
  // Set a cookie with the token
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Must be accessible by client JavaScript
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'strict'
  });
  
  next();
}; 