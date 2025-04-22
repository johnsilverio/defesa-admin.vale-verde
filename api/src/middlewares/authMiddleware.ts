import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { User } from '../models/user';
import crypto from 'crypto';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Tipo customizado para middleware do Express que corrige o problema de tipagem retornando void
 */
type CustomRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Middleware to authenticate users
export const authMiddleware: CustomRequestHandler = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Não autorizado, token não fornecido', 
        code: 'NO_TOKEN' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor', 
        code: 'SERVER_ERROR' 
      });
    }
    
    // Decode token
    try {
      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado', 
          code: 'USER_NOT_FOUND' 
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          error: 'Token expirado', 
          code: 'TOKEN_EXPIRED' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
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

// Middleware to check if user is admin
export const adminMiddleware: CustomRequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso', 
      code: 'NOT_ADMIN' 
    });
  }
  next();
};

/**
 * Middleware for authentication using JWT
 * Alternative implementation that also checks for cookies
 */
export const authenticate: CustomRequestHandler = (req, res, next) => {
  // Get token from header or cookies
  const auth = req.headers.authorization;
  const tokenFromCookie = req.cookies?.authToken;
  
  // If no token anywhere, return error
  if ((!auth || !auth.startsWith('Bearer ')) && !tokenFromCookie) {
    res.status(401).json({ 
      error: 'Autenticação necessária', 
      code: 'MISSING_TOKEN' 
    });
    return;
  }
  
  // Prioritize header token, but accept cookie as fallback
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

  // Get JWT secret, with safe fallback
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
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded as Express.Request['user'];
    
    // Log access attempt for audit (in production could use a logger)
    if (process.env.NODE_ENV === 'production') {
      console.info(`Authenticated access: ${req.user?.email} (${req.user?.role}) - ${req.method} ${req.originalUrl}`);
    }
    
    next();
  } catch (error) {
    // Specific handling for expired tokens
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expirado', 
        code: 'TOKEN_EXPIRED',
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
      return;
    }
    
    // Other token errors
    res.status(401).json({ 
      error: 'Token inválido', 
      code: 'INVALID_TOKEN',
      message: error instanceof Error ? error.message : 'Erro na verificação do token'
    });
    return;
  }
};

/**
 * Middleware to check if user is an admin
 * Should be used after authenticate middleware
 */
export const requireAdmin: CustomRequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ 
      error: 'Usuário não autenticado', 
      code: 'NOT_AUTHENTICATED' 
    });
    return;
  }
  
  if (req.user.role !== 'admin') {
    // Log unauthorized admin access attempt
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
 * Middleware to add CSRF token in all responses
 * to prevent CSRF (Cross-Site Request Forgery) attacks
 */
export const csrfProtection: CustomRequestHandler = (req, res, next) => {
  // Generate a unique CSRF token for this session
  const csrfToken = crypto.randomBytes(16).toString('hex');
  
  // Store it in response variables to be sent
  res.locals.csrfToken = csrfToken;
  
  // Set a cookie with the token
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Must be accessible by client JavaScript
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'strict'
  });
  
  next();
}; 