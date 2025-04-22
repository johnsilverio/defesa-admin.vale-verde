// src/routes/index.ts
import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as documentController from '../controllers/documentController';
import * as propertyController from '../controllers/propertyController';
import * as categoryController from '../controllers/categoryController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = Router();

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auth routes removidas - usaremos o router de autenticação específico em /api/auth

// Property routes
router.get('/properties', authMiddleware, propertyController.getAllProperties);
router.get('/properties/:id', authMiddleware, propertyController.getPropertyById);
router.post('/properties', authMiddleware, adminMiddleware, propertyController.createProperty);
router.put('/properties/:id', authMiddleware, adminMiddleware, propertyController.updateProperty);
router.delete('/properties/:id', authMiddleware, adminMiddleware, propertyController.deleteProperty);

// Category routes
router.get('/categories', authMiddleware, categoryController.getAllCategories);
router.get('/categories/:id', authMiddleware, categoryController.getCategoryById);
router.post('/categories', authMiddleware, adminMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

// Document routes
router.get('/documents', authMiddleware, documentController.getAllDocuments);
router.get('/documents/:id', authMiddleware, documentController.getDocumentById);
router.post('/documents', authMiddleware, upload.single('file'), documentController.createDocument);
router.put('/documents/:id', authMiddleware, upload.single('file'), documentController.updateDocument);
router.delete('/documents/:id', authMiddleware, adminMiddleware, documentController.deleteDocument);
router.get('/documents/:id/download', authMiddleware, documentController.downloadDocument);

export default router;