import { Router, RequestHandler } from 'express';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

/**
 * Upload de arquivos (usuários autenticados)
 * (A lógica real de upload para Supabase deve estar no controller, aqui só faz o upload para memória)
 */
router.post('/', authenticate, upload.single('file'), ((req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado', code: 'NO_FILE' });
  }
  // Aqui você pode chamar a lógica de upload para Supabase se desejar
  res.status(201).json({
    success: true,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
}) as RequestHandler);

/**
 * Listar arquivos (não suportado com Supabase Storage)
 */
router.get('/', authenticate, requireAdmin, ((req, res) => {
  res.status(501).json({ error: 'Listagem de arquivos não suportada com Supabase Storage.' });
}) as RequestHandler);

/**
 * Excluir arquivo (não suportado com Supabase Storage)
 */
router.delete('/:filename', authenticate, requireAdmin, ((req, res) => {
  res.status(501).json({ error: 'Exclusão direta de arquivos não suportada com Supabase Storage.' });
}) as RequestHandler);

export default router;
