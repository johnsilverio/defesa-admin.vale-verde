import { IUser } from '../models/user';
import { Request, Response, NextFunction } from 'express';

// Estender a interface Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Tipo customizado para qualquer middleware ou controlador Express
 * com retorno flexível (não importando o tipo de retorno)
 */
export type AnyRequestHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => any; 