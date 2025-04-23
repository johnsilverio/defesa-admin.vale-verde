import { IUser } from '../models/user';
import { Request, Response, NextFunction } from 'express';

// Extensão do tipo Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Tipo para handlers de requisições Express
 * Útil para controladores e middlewares com retorno flexível
 */
export type AnyRequestHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => any;