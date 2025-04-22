import { Router } from 'express';
import { login, register, refreshAccessToken, logout, listUsers } from '../controllers/authController';
import { authenticate, requireAdmin, csrfProtection } from '../middleware/auth';
import { User } from '../models/user';

const router = Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Rota protegida - obter informações do usuário atual
router.get('/me', authenticate, (req, res) => {
  // O middleware authenticate já adicionou o usuário ao req
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role
    }
  });
});

// Rota protegida - validar token
router.get('/validate', authenticate, (req, res) => {
  res.json({ 
    valid: true,
    message: 'Token válido',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role
    }
  });
});

// Rota protegida de administrador - listar usuários
router.get('/users', authenticate, requireAdmin, listUsers);

// Rota para verificar se o usuário é administrador
router.get('/admin-check', authenticate, requireAdmin, (req, res) => {
  res.json({ 
    message: 'Você tem acesso administrativo',
    role: req.user?.role
  });
});

export default router;
