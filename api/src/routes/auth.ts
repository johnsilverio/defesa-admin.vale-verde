import { Router } from 'express';
import { login, register, refreshToken, logout, listUsers, updateUser, deleteUser } from '../controllers/authController';
import { authenticate, requireAdmin, csrfProtection } from '../middlewares/authMiddleware';
import { User } from '../models/user';

const router = Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Rota protegida - obter informações do usuário atual
router.get('/me', authenticate, (req, res) => {
  // O middleware authenticate já adicionou o usuário ao req
  res.json({
    user: {
      id: req.user?._id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role,
      properties: req.user?.properties
    }
  });
});

// Rota protegida - validar token
router.get('/validate', authenticate, (req, res) => {
  res.json({ 
    valid: true,
    message: 'Token válido',
    user: {
      id: req.user?._id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role,
      properties: req.user?.properties
    }
  });
});

// Rotas protegidas de administrador para gerenciamento de usuários
router.get('/users', authenticate, requireAdmin, listUsers);
router.put('/users/:id', authenticate, requireAdmin, updateUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

// Rota para verificar se o usuário é administrador
router.get('/admin-check', authenticate, requireAdmin, (req, res) => {
  res.json({ 
    message: 'Você tem acesso administrativo',
    role: req.user?.role
  });
});

export default router;
