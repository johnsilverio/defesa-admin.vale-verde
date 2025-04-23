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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = exports.requireAdmin = exports.authenticate = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const user_1 = require("../models/user");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Middleware de autenticação JWT.
 * Verifica o token no header Authorization ou cookie e adiciona o usuário à requisição.
 */
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        const tokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken;
        if ((!authHeader || !authHeader.startsWith('Bearer ')) && !tokenFromCookie) {
            return res.status(401).json({ error: 'Não autorizado, token não fornecido', code: 'NO_TOKEN' });
        }
        const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))
            ? authHeader.split(' ')[1]
            : tokenFromCookie;
        if (!token) {
            return res.status(401).json({ error: 'Token ausente', code: 'MISSING_TOKEN' });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ error: 'Erro de configuração do servidor', code: 'SERVER_ERROR' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            const user = yield user_1.User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED', message: 'Sua sessão expirou. Por favor, faça login novamente.' });
            }
            return res.status(401).json({ error: 'Token inválido', code: 'INVALID_TOKEN', message: error instanceof Error ? error.message : 'Erro na verificação do token' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno do servidor', code: 'SERVER_ERROR' });
    }
});
exports.authMiddleware = authMiddleware;
/**
 * Middleware para verificar se o usuário é admin.
 * Deve ser usado após o middleware de autenticação.
 */
const adminMiddleware = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso', code: 'NOT_ADMIN' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
/**
 * Middleware alternativo de autenticação JWT.
 * Aceita token no header ou cookie.
 */
const authenticate = (req, res, next) => {
    var _a;
    const auth = req.headers.authorization;
    const tokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken;
    if ((!auth || !auth.startsWith('Bearer ')) && !tokenFromCookie) {
        res.status(401).json({ error: 'Autenticação necessária', code: 'MISSING_TOKEN' });
        return;
    }
    const token = (auth === null || auth === void 0 ? void 0 : auth.startsWith('Bearer '))
        ? auth.split(' ')[1]
        : tokenFromCookie;
    if (!token) {
        res.status(401).json({ error: 'Token ausente', code: 'MISSING_TOKEN' });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ error: 'Erro de configuração do servidor', code: 'SERVER_CONFIGURATION_ERROR' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED', message: 'Sua sessão expirou. Por favor, faça login novamente.' });
            return;
        }
        res.status(401).json({ error: 'Token inválido', code: 'INVALID_TOKEN', message: error instanceof Error ? error.message : 'Erro na verificação do token' });
        return;
    }
};
exports.authenticate = authenticate;
/**
 * Middleware para exigir autenticação de admin.
 * Deve ser usado após autenticação.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado', code: 'NOT_AUTHENTICATED' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso', code: 'ADMIN_REQUIRED' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware para adicionar token CSRF em todas as respostas.
 * Previne ataques CSRF (Cross-Site Request Forgery).
 */
const csrfProtection = (req, res, next) => {
    const csrfToken = crypto_1.default.randomBytes(16).toString('hex');
    res.locals.csrfToken = csrfToken;
    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    next();
};
exports.csrfProtection = csrfProtection;
