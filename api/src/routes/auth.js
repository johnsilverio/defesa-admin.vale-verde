"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * Rotas públicas de autenticação
 */
router.post('/login', authController_1.login);
router.post('/register', authController_1.register);
router.post('/refresh', authController_1.refreshToken);
router.post('/logout', authController_1.logout);
/**
 * Retorna informações do usuário autenticado
 */
router.get('/me', authMiddleware_1.authenticate, (req, res) => {
    var _a, _b, _c, _d, _e;
    res.json({
        user: {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            name: (_c = req.user) === null || _c === void 0 ? void 0 : _c.name,
            role: (_d = req.user) === null || _d === void 0 ? void 0 : _d.role,
            properties: (_e = req.user) === null || _e === void 0 ? void 0 : _e.properties
        }
    });
});
/**
 * Valida o token de autenticação
 */
router.get('/validate', authMiddleware_1.authenticate, (req, res) => {
    var _a, _b, _c, _d, _e;
    res.json({
        valid: true,
        message: 'Token válido',
        user: {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            name: (_c = req.user) === null || _c === void 0 ? void 0 : _c.name,
            role: (_d = req.user) === null || _d === void 0 ? void 0 : _d.role,
            properties: (_e = req.user) === null || _e === void 0 ? void 0 : _e.properties
        }
    });
});
/**
 * Rotas de administração de usuários (apenas admin)
 */
router.get('/users', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, authController_1.listUsers);
router.put('/users/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, authController_1.updateUser);
router.delete('/users/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, authController_1.deleteUser);
/**
 * Verifica permissão de admin
 */
router.get('/admin-check', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => {
    var _a;
    res.json({
        message: 'Você tem acesso administrativo',
        role: (_a = req.user) === null || _a === void 0 ? void 0 : _a.role
    });
});
exports.default = router;
