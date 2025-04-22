import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { User } from '../models/user';

// Estender a interface Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: 'user' | 'admin';
        name?: string;
      };
    }
  }
}

/**
 * Tipo customizado para middleware do Express que corrige o problema de tipagem retornando void
 */
type CustomRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Middleware para autenticar usuários com JWT
 * Verifica se o token está presente e é válido
 */
export const authenticate: CustomRequestHandler = (req, res, next) => {
  // Obtém o token do header Authorization ou de cookies
  const auth = req.headers.authorization;
  const tokenFromCookie = req.cookies?.authToken;
  
  // Se não houver token em nenhum lugar, retorna erro
  if ((!auth || !auth.startsWith('Bearer ')) && !tokenFromCookie) {
    res.status(401).json({ 
      error: 'Autenticação necessária', 
      code: 'MISSING_TOKEN' 
    });
    return;
  }
  
  // Prioriza o token do header, mas aceita do cookie como fallback
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

  // Obtém o segredo JWT, com fallback seguro
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('ALERTA DE SEGURANÇA: JWT_SECRET não está definido no ambiente!');
    res.status(500).json({ 
      error: 'Erro de configuração do servidor', 
      code: 'SERVER_CONFIGURATION_ERROR' 
    });
    return;
  }
  
  try {
    // Verifica o token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded as Express.Request['user'];
    
    // Registra tentativa de acesso para auditoria (em ambiente de produção poderia usar um logger)
    if (process.env.NODE_ENV === 'production') {
      console.info(`Acesso autenticado: ${req.user?.email} (${req.user?.role}) - ${req.method} ${req.originalUrl}`);
    }
    
    next();
  } catch (error) {
    // Tratamento específico para tokens expirados
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expirado', 
        code: 'TOKEN_EXPIRED',
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
      return;
    }
    
    // Outros erros de token
    res.status(401).json({ 
      error: 'Token inválido', 
      code: 'INVALID_TOKEN',
      message: error instanceof Error ? error.message : 'Erro na verificação do token'
    });
    return;
  }
};

/**
 * Middleware para verificar se o usuário é um administrador
 * Deve ser usado após o middleware authenticate
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
    // Registra tentativa de acesso administrativo não autorizado
    console.warn(`Tentativa de acesso administrativo não autorizado: ${req.user?.email} - ${req.method} ${req.originalUrl}`);
    
    res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso', 
      code: 'ADMIN_REQUIRED' 
    });
    return;
  }
  
  next();
};

/**
 * Middleware para adicionar token CSRF em todas as respostas
 * para prevenir ataques CSRF (Cross-Site Request Forgery)
 */
export const csrfProtection: CustomRequestHandler = (req, res, next) => {
  // Gera um token CSRF único para esta sessão
  const csrfToken = require('crypto').randomBytes(16).toString('hex');
  
  // Armazena-o em variáveis de resposta para ser enviado
  res.locals.csrfToken = csrfToken;
  
  // Define um cookie com o token
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Precisa ser acessível pelo JavaScript do cliente
    secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
    sameSite: 'strict'
  });
  
  next();
};
