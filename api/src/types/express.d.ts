import { IUser } from '../models/user';

// Estender a interface Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
} 