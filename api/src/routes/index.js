"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const documentController = __importStar(require("../controllers/documentController"));
const propertyController = __importStar(require("../controllers/propertyController"));
const categoryController = __importStar(require("../controllers/categoryController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configuração do multer para upload de arquivos
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});
/**
 * Rotas de propriedades, categorias e documentos protegidas por autenticação/admin.
 */
// Rotas de propriedades
router.get('/properties', authMiddleware_1.authMiddleware, propertyController.getAllProperties);
router.get('/properties/:id', authMiddleware_1.authMiddleware, propertyController.getPropertyById);
router.post('/properties', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, propertyController.createProperty);
router.put('/properties/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, propertyController.updateProperty);
router.delete('/properties/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, propertyController.deleteProperty);
// Rotas de categorias
router.get('/categories', authMiddleware_1.authMiddleware, categoryController.getAllCategories);
router.get('/categories/:id', authMiddleware_1.authMiddleware, categoryController.getCategoryById);
router.post('/categories', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.deleteCategory);
router.put('/categories-order', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.updateCategoriesOrder);
// Rotas de documentos
router.get('/documents', authMiddleware_1.authMiddleware, documentController.getAllDocuments);
router.get('/documents/:id', authMiddleware_1.authMiddleware, documentController.getDocumentById);
router.post('/documents', authMiddleware_1.authMiddleware, upload.single('file'), documentController.createDocument);
router.put('/documents/:id', authMiddleware_1.authMiddleware, upload.single('file'), documentController.updateDocument);
router.delete('/documents/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, documentController.deleteDocument);
router.get('/documents/:id/download', authMiddleware_1.authMiddleware, documentController.downloadDocument);
exports.default = router;
