import { Router } from 'express';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/documentController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública - qualquer pessoa pode ver documentos
router.get('/', getDocuments);

// Rotas protegidas - apenas usuários autenticados podem enviar
router.post('/', authenticate, uploadDocument);

// Rotas administrativas - apenas administradores podem deletar
router.delete('/:id', authenticate, requireAdmin, deleteDocument);

export default router;
