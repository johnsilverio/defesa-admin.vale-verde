import { Router } from 'express';
import multer from 'multer';
import { getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, downloadDocument } from '../controllers/documentController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit to 10MB
  }
});

const router = Router();

// Public routes - anyone can view documents
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);

// Protected routes - authenticated users can upload
router.post('/', authenticate, upload.single('file'), createDocument);
router.put('/:id', authenticate, upload.single('file'), updateDocument);

// Admin routes - only admins can delete
router.delete('/:id', authenticate, requireAdmin, deleteDocument);

export default router;
