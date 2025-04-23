import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../src/routes/auth';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Mock aprimorado do serviço Supabase para incluir as funções de gerenciamento de pastas
jest.mock('../src/services/storageService', () => ({
  uploadFile: jest.fn().mockImplementation(async (path) => {
    console.log(`Mock: Upload de arquivo para ${path}`);
    return { path: path };
  }),
  getFileUrl: jest.fn().mockImplementation(async (path) => {
    console.log(`Mock: Gerando URL para ${path}`);
    return `https://mock-supabase.com/${path}?token=signed`;
  }),
  deleteFile: jest.fn().mockImplementation(async (path) => {
    console.log(`Mock: Excluindo arquivo ${path}`);
    // Esta função não retorna nada no original
  }),
  createFolder: jest.fn().mockImplementation(async (path) => {
    console.log(`Mock: Criando pasta ${path}`);
    return { path: `${path}/.folder` };
  }),
  folderExists: jest.fn().mockImplementation(async (path) => {
    console.log(`Mock: Verificando se pasta ${path} existe`);
    return true;
  }),
  listFolderContents: jest.fn().mockImplementation(async (path) => {
    console.log(`Mock: Listando conteúdo da pasta ${path}`);
    return [{ name: 'arquivo-mock.pdf', id: 'mock-id' }];
  }),
}));

// Carrega variáveis de ambiente para os testes
dotenv.config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.MONGODB_URI = 'mongodb://localhost:27017/defesa-admin-test';
// Definindo variáveis de ambiente simuladas para o Supabase
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'mock-key';
process.env.SUPABASE_BUCKET = 'mock-bucket';
// Sinalizando que estamos em ambiente serverless (como Vercel)
process.env.VERCEL = '1';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await mongoose.connection.dropDatabase();
});
afterAll(async () => {
  await mongoose.disconnect();
});

describe('Auth API', () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'test1234',
  };

  let accessToken = '';
  let refreshToken = '';

  /** Registro de usuário */
  it('deve registrar um novo usuário', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.role).toBe('user');
  });

  /** Login com usuário registrado */
  it('deve fazer login com usuário registrado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  /** Login com credenciais inválidas */
  it('não deve logar com senha errada', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'errada' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });

  /** Validação de token */
  it('deve validar token de acesso', async () => {
    const res = await request(app)
      .get('/api/auth/validate')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.user.email).toBe(user.email);
  });

  /** Refresh token */
  it('deve renovar o token de acesso', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .send({ refreshToken });
    // Atualiza o refreshToken para o novo, caso precise ser usado em testes seguintes
    refreshToken = res.body.refreshToken;
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  /** Logout */
  it('deve realizar logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logout/i);
  });
});