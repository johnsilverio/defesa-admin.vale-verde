// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import documentRoutes from './documents';
import uploadRoutes from './uploads';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Rotas públicas (não requerem autenticação)
router.use('/api/auth', authRoutes);

// Rotas que requerem autenticação
router.use('/api/documents', documentRoutes); // Algumas rotas internas possuem middleware de autenticação
router.use('/api/uploads', authenticate, uploadRoutes); // Todas as rotas aqui requerem autenticação

// Rota para verificar autenticação
router.get('/api/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role
    }
  });
});

// Rota para verificação de saúde da API
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;