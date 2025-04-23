import { Router } from 'express';
import { getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, downloadDocument } from '../controllers/documentController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

/**
 * Rotas públicas de documentos
 */
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);

/**
 * Rotas protegidas de documentos (autenticado)
 */
router.post('/', authenticate, upload.single('file'), createDocument);
router.put('/:id', authenticate, upload.single('file'), updateDocument);

/**
 * Rotas de administração de documentos (apenas admin)
 */
router.delete('/:id', authenticate, requireAdmin, deleteDocument);

export default router;
