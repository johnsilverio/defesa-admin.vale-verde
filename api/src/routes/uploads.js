"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
/**
 * Upload de arquivos (usuários autenticados)
 * (A lógica real de upload para Supabase deve estar no controller, aqui só faz o upload para memória)
 */
router.post('/', authMiddleware_1.authenticate, upload_1.upload.single('file'), ((req, res) => {
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
}));
/**
 * Listar arquivos (não suportado com Supabase Storage)
 */
router.get('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, ((req, res) => {
    res.status(501).json({ error: 'Listagem de arquivos não suportada com Supabase Storage.' });
}));
/**
 * Excluir arquivo (não suportado com Supabase Storage)
 */
router.delete('/:filename', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, ((req, res) => {
    res.status(501).json({ error: 'Exclusão direta de arquivos não suportada com Supabase Storage.' });
}));
exports.default = router;
