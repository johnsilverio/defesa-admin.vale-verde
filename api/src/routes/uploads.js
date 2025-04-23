"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Configuração do armazenamento de arquivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (!fs_1.default.existsSync('uploads')) {
            fs_1.default.mkdirSync('uploads', { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de arquivo não permitido. Apenas PDF e Word são aceitos.'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});
const router = (0, express_1.Router)();
/**
 * Upload de arquivos (usuários autenticados)
 */
router.post('/', authMiddleware_1.authenticate, upload.single('file'), ((req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado', code: 'NO_FILE' });
    }
    res.status(201).json({
        success: true,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
    });
}));
/**
 * Listar arquivos (apenas administradores)
 */
router.get('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, ((req, res) => {
    fs_1.default.readdir('uploads', (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao listar arquivos', code: 'LIST_ERROR', message: err.message });
        }
        res.json({ files });
    });
}));
/**
 * Excluir arquivo (apenas administradores)
 */
router.delete('/:filename', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, ((req, res) => {
    const { filename } = req.params;
    const filePath = path_1.default.join('uploads', filename);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ error: 'Arquivo não encontrado', code: 'FILE_NOT_FOUND' });
    }
    fs_1.default.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao excluir arquivo', code: 'DELETE_ERROR', message: err.message });
        }
        res.json({ success: true, message: 'Arquivo excluído com sucesso' });
    });
}));
exports.default = router;
