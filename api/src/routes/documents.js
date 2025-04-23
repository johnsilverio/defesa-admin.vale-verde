"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documentController_1 = require("../controllers/documentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
const router = (0, express_1.Router)();
/**
 * Rotas públicas de documentos
 */
router.get('/', documentController_1.getAllDocuments);
router.get('/:id', documentController_1.getDocumentById);
router.get('/:id/download', documentController_1.downloadDocument);
/**
 * Rotas protegidas de documentos (autenticado)
 */
router.post('/', authMiddleware_1.authenticate, upload.single('file'), documentController_1.createDocument);
router.put('/:id', authMiddleware_1.authenticate, upload.single('file'), documentController_1.updateDocument);
/**
 * Rotas de administração de documentos (apenas admin)
 */
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, documentController_1.deleteDocument);
exports.default = router;
