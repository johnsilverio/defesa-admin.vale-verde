import { Router } from 'express';
import { login, register, refreshToken, logout, listUsers, updateUser, deleteUser } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

/**
 * Rotas públicas de autenticação
 */
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

/**
 * Retorna informações do usuário autenticado
 */
router.get('/me', authenticate, (req, res) => {
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

/**
 * Valida o token de autenticação
 */
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

/**
 * Rotas de administração de usuários (apenas admin)
 */
router.get('/users', authenticate, requireAdmin, listUsers);
router.put('/users/:id', authenticate, requireAdmin, updateUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

/**
 * Verifica permissão de admin
 */
router.get('/admin-check', authenticate, requireAdmin, (req, res) => {
  res.json({ 
    message: 'Você tem acesso administrativo',
    role: req.user?.role
  });
});

export default router;
