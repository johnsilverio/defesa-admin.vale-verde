"use strict";
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
exports.deleteUser = exports.updateUser = exports.listUsers = exports.logout = exports.getCurrentUser = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const user_1 = require("../models/user");
const crypto_1 = __importDefault(require("crypto"));
// Armazena temporariamente refresh tokens (em produção, use banco de dados)
const refreshTokens = new Map();
// Schemas de validação
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    role: zod_1.z.enum(['user', 'admin']).optional(),
    properties: zod_1.z.array(zod_1.z.string()).optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória')
});
const ACCESS_TOKEN_EXPIRY = '4h';
const REFRESH_TOKEN_EXPIRY = '7d';
/**
 * Gera tokens de acesso e refresh para autenticação.
 */
const generateTokens = (user) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
        throw new Error('JWT_SECRET não está definido');
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role, name: user.name, properties: user.properties }, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = crypto_1.default.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    refreshTokens.set(refreshToken, { userId: user._id.toString(), expiresAt });
    return { accessToken, refreshToken };
};
/**
 * Registra um novo usuário.
 * @route POST /api/auth/register
 */
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ error: 'Dados de registro inválidos', details: parseResult.error.format() });
            return;
        }
        const { email, password, name, role = 'user', properties = [] } = parseResult.data;
        const existingUser = yield user_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ error: 'Usuário já existe', code: 'USER_EXISTS' });
            return;
        }
        const userProperties = role === 'user' && properties.length === 0 ? ['fazenda-brilhante'] : properties;
        const finalProperties = role === 'admin' ? [] : userProperties;
        const newUser = new user_1.User({ email, password, name, role, properties: finalProperties });
        yield newUser.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso', user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role, properties: newUser.properties } });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
/**
 * Autentica um usuário e gera tokens.
 * @route POST /api/auth/login
 */
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ error: 'Dados de login inválidos', message: 'Por favor, forneça email e senha válidos', details: parseResult.error.format() });
            return;
        }
        const { email, password } = parseResult.data;
        const user = yield user_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Credenciais inválidas', message: 'Email ou senha incorretos', code: 'INVALID_CREDENTIALS' });
            return;
        }
        const passwordValid = yield user.comparePassword(password);
        if (!passwordValid) {
            res.status(401).json({ error: 'Credenciais inválidas', message: 'Email ou senha incorretos', code: 'INVALID_CREDENTIALS' });
            return;
        }
        try {
            const { accessToken, refreshToken } = generateTokens(user);
            res.cookie('authToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api/auth/refresh'
            });
            res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, role: user.role, name: user.name, properties: user.properties } });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao processar login', message: error instanceof Error ? error.message : 'Erro interno do servidor' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
/**
 * Renova o token de acesso usando um refresh token válido.
 * @route POST /api/auth/refresh
 */
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token não fornecido', code: 'MISSING_REFRESH_TOKEN' });
            return;
        }
        const tokenData = refreshTokens.get(refreshToken);
        if (!tokenData) {
            res.status(401).json({ error: 'Refresh token inválido', code: 'INVALID_REFRESH_TOKEN' });
            return;
        }
        if (tokenData.expiresAt < new Date()) {
            refreshTokens.delete(refreshToken);
            res.status(401).json({ error: 'Refresh token expirado', code: 'EXPIRED_REFRESH_TOKEN' });
            return;
        }
        const user = yield user_1.User.findById(tokenData.userId);
        if (!user) {
            refreshTokens.delete(refreshToken);
            res.status(401).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
            return;
        }
        try {
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
            refreshTokens.delete(refreshToken);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api/auth/refresh'
            });
            res.json({ accessToken, refreshToken: newRefreshToken });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao processar renovação de token', message: error instanceof Error ? error.message : 'Erro interno do servidor' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
/**
 * Retorna informações do usuário autenticado.
 * @route GET /api/auth/me
 */
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado', code: 'NOT_AUTHENTICATED' });
        }
        res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, properties: req.user.properties } });
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
/**
 * Realiza logout e invalida o refresh token.
 * @route POST /api/auth/logout
 */
const logout = (req, res, next) => {
    var _a;
    try {
        const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
        if (refreshToken)
            refreshTokens.delete(refreshToken);
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh'
        });
        res.json({ message: 'Logout realizado com sucesso' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
/**
 * Lista todos os usuários cadastrados (admin).
 * @route GET /api/auth/users
 */
const listUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.User.find({}, { password: 0 });
        const formattedUsers = users.map(user => ({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, properties: user.properties }));
        res.json({ users: formattedUsers });
    }
    catch (error) {
        next(error);
    }
});
exports.listUsers = listUsers;
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório').optional(),
    email: zod_1.z.string().email('Email inválido').optional(),
    role: zod_1.z.enum(['user', 'admin']).optional(),
    properties: zod_1.z.array(zod_1.z.string()).optional(),
    password: zod_1.z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional()
});
/**
 * Atualiza dados de um usuário.
 * @route PUT /api/auth/users/:id
 */
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'ID de usuário inválido', code: 'INVALID_USER_ID' });
        }
        const userExists = yield user_1.User.findById(id);
        if (!userExists) {
            return res.status(404).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
        }
        const parseResult = updateUserSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Dados de atualização inválidos', details: parseResult.error.format() });
        }
        const updateData = parseResult.data;
        if (updateData.role === 'admin')
            updateData.properties = [];
        if (updateData.role === 'user' && (!updateData.properties || updateData.properties.length === 0))
            updateData.properties = ['fazenda-brilhante'];
        const updatedUser = yield user_1.User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ error: 'Erro ao atualizar usuário', code: 'UPDATE_FAILED' });
        }
        const formattedUser = { id: updatedUser._id.toString(), name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, properties: updatedUser.properties };
        res.json({ message: 'Usuário atualizado com sucesso', user: formattedUser });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
/**
 * Remove um usuário do sistema.
 * @route DELETE /api/auth/users/:id
 */
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'ID de usuário inválido', code: 'INVALID_USER_ID' });
        }
        const userExists = yield user_1.User.findById(id);
        if (!userExists) {
            return res.status(404).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
        }
        if (req.user && req.user.id && req.user.id === id) {
            return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário', code: 'CANNOT_DELETE_SELF' });
        }
        yield user_1.User.findByIdAndDelete(id);
        res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
