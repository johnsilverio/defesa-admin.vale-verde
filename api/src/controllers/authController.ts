import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, IUser } from '../models/user';
import crypto from 'crypto';
import { AnyRequestHandler } from '../types/express';

// Armazena temporariamente refresh tokens (em produção, use banco de dados)
const refreshTokens: Map<string, { userId: string, expiresAt: Date }> = new Map();

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.enum(['user', 'admin']).optional(),
  properties: z.array(z.string()).optional()
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const ACCESS_TOKEN_EXPIRY = '4h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Gera tokens de acesso e refresh para autenticação.
 */
const generateTokens = (user: IUser) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET não está definido');
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, properties: user.properties },
    jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  refreshTokens.set(refreshToken, { userId: user._id.toString(), expiresAt });
  return { accessToken, refreshToken };
};

/**
 * Registra um novo usuário.
 * @route POST /api/auth/register
 */
export const register: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Dados de registro inválidos', details: parseResult.error.format() });
      return;
    }
    const { email, password, name, role = 'user', properties = [] } = parseResult.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'Usuário já existe', code: 'USER_EXISTS' });
      return;
    }
    const userProperties = role === 'user' && properties.length === 0 ? ['fazenda-brilhante'] : properties;
    const finalProperties = role === 'admin' ? [] : userProperties;
    const newUser = new User({ email, password, name, role, properties: finalProperties });
    await newUser.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso', user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role, properties: newUser.properties } });
  } catch (error) {
    next(error);
  }
};

/**
 * Autentica um usuário e gera tokens.
 * @route POST /api/auth/login
 */
export const login: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Dados de login inválidos', message: 'Por favor, forneça email e senha válidos', details: parseResult.error.format() });
      return;
    }
    const { email, password } = parseResult.data;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas', message: 'Email ou senha incorretos', code: 'INVALID_CREDENTIALS' });
      return;
    }
    const passwordValid = await user.comparePassword(password);
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
    } catch (error) {
      res.status(500).json({ error: 'Erro ao processar login', message: error instanceof Error ? error.message : 'Erro interno do servidor' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Renova o token de acesso usando um refresh token válido.
 * @route POST /api/auth/refresh
 */
export const refreshToken: AnyRequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
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
    const user = await User.findById(tokenData.userId);
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
    } catch (error) {
      res.status(500).json({ error: 'Erro ao processar renovação de token', message: error instanceof Error ? error.message : 'Erro interno do servidor' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Retorna informações do usuário autenticado.
 * @route GET /api/auth/me
 */
export const getCurrentUser: AnyRequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado', code: 'NOT_AUTHENTICATED' });
    }
    res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, properties: req.user.properties } });
  } catch (error) {
    next(error);
  }
};

/**
 * Realiza logout e invalida o refresh token.
 * @route POST /api/auth/logout
 */
export const logout: AnyRequestHandler = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (refreshToken) refreshTokens.delete(refreshToken);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh'
    });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista todos os usuários cadastrados (admin).
 * @route GET /api/auth/users
 */
export const listUsers: AnyRequestHandler = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 });
    const formattedUsers = users.map(user => ({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, properties: user.properties }));
    res.json({ users: formattedUsers });
  } catch (error) {
    next(error);
  }
};

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['user', 'admin']).optional(),
  properties: z.array(z.string()).optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional()
});

/**
 * Atualiza dados de um usuário.
 * @route PUT /api/auth/users/:id
 */
export const updateUser: AnyRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'ID de usuário inválido', code: 'INVALID_USER_ID' });
    }
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
    }
    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Dados de atualização inválidos', details: parseResult.error.format() });
    }
    const updateData = parseResult.data;
    if (updateData.role === 'admin') updateData.properties = [];
    if (updateData.role === 'user' && (!updateData.properties || updateData.properties.length === 0)) updateData.properties = ['fazenda-brilhante'];
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ error: 'Erro ao atualizar usuário', code: 'UPDATE_FAILED' });
    }
    const formattedUser = { id: updatedUser._id.toString(), name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, properties: updatedUser.properties };
    res.json({ message: 'Usuário atualizado com sucesso', user: formattedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove um usuário do sistema.
 * @route DELETE /api/auth/users/:id
 */
export const deleteUser: AnyRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'ID de usuário inválido', code: 'INVALID_USER_ID' });
    }
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' });
    }
    if (req.user && req.user.id && req.user.id === id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário', code: 'CANNOT_DELETE_SELF' });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
