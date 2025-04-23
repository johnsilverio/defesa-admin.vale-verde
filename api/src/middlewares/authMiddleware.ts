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
 * Middleware de autenticação JWT.
 * Verifica o token no header Authorization ou cookie e adiciona o usuário à requisição.
 */
export const authMiddleware: AnyRequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.authToken;
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !tokenFromCookie) {
      return res.status(401).json({ error: 'Não autorizado, token não fornecido', code: 'NO_TOKEN' });
    }
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : tokenFromCookie;
    if (!token) {
      return res.status(401).json({ error: 'Token ausente', code: 'MISSING_TOKEN' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Erro de configuração do servidor', code: 'SERVER_ERROR' });
    }
    try {
      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
      }
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED', message: 'Sua sessão expirou. Por favor, faça login novamente.' });
      }
      return res.status(401).json({ error: 'Token inválido', code: 'INVALID_TOKEN', message: error instanceof Error ? error.message : 'Erro na verificação do token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor', code: 'SERVER_ERROR' });
  }
};

/**
 * Middleware para verificar se o usuário é admin.
 * Deve ser usado após o middleware de autenticação.
 */
export const adminMiddleware: AnyRequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso', code: 'NOT_ADMIN' });
  }
  next();
};

/**
 * Middleware alternativo de autenticação JWT.
 * Aceita token no header ou cookie.
 */
export const authenticate: AnyRequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  const tokenFromCookie = req.cookies?.authToken;
  if ((!auth || !auth.startsWith('Bearer ')) && !tokenFromCookie) {
    res.status(401).json({ error: 'Autenticação necessária', code: 'MISSING_TOKEN' });
    return;
  }
  const token = auth?.startsWith('Bearer ')
    ? auth.split(' ')[1]
    : tokenFromCookie;
  if (!token) {
    res.status(401).json({ error: 'Token ausente', code: 'MISSING_TOKEN' });
    return;
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: 'Erro de configuração do servidor', code: 'SERVER_CONFIGURATION_ERROR' });
    return;
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded as Express.Request['user'];
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED', message: 'Sua sessão expirou. Por favor, faça login novamente.' });
      return;
    }
    res.status(401).json({ error: 'Token inválido', code: 'INVALID_TOKEN', message: error instanceof Error ? error.message : 'Erro na verificação do token' });
    return;
  }
};

/**
 * Middleware para exigir autenticação de admin.
 * Deve ser usado após autenticação.
 */
export const requireAdmin: AnyRequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado', code: 'NOT_AUTHENTICATED' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso', code: 'ADMIN_REQUIRED' });
    return;
  }
  next();
};

/**
 * Middleware para adicionar token CSRF em todas as respostas.
 * Previne ataques CSRF (Cross-Site Request Forgery).
 */
export const csrfProtection: AnyRequestHandler = (req, res, next) => {
  const csrfToken = crypto.randomBytes(16).toString('hex');
  res.locals.csrfToken = csrfToken;
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
};