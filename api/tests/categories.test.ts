import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import routes from '../src/routes/index';
import authRouter from '../src/routes/auth';
import documentsRouter from '../src/routes/documents';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
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

// Configuração completa do app como no server.ts real
const app = express();

// Middlewares essenciais
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Registra as rotas
app.use('/api', routes);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

// Adiciona middleware de erro para capturar erro 500 durante testes
app.use((err: any, req: any, res: any, next: any) => {
  console.error('ERRO NO TESTE CATEGORIA:', err);
  res.status(500).json({ error: 'Erro interno', details: err.message });
});

let adminToken = '';
let propertyId = '';
let propertySlug = '';

beforeAll(async () => {
  try {
    // Conecta ao MongoDB e limpa o banco
    await mongoose.connect(process.env.MONGODB_URI!);
    await mongoose.connection.dropDatabase();
    
    // Removemos a criação de pasta local, pois agora usamos Supabase
    
    // Cria admin
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin1@admin.com', password: 'admin123', role: 'admin' });
    
    console.log('Registro admin:', reg.status, reg.body);
    
    if (reg.status !== 201) {
      throw new Error(`Falha ao registrar admin: ${JSON.stringify(reg.body)}`);
    }
    
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin1@admin.com', password: 'admin123' });
    
    console.log('Login admin:', login.status, login.body);
    
    if (login.status !== 200) {
      throw new Error(`Falha ao fazer login: ${JSON.stringify(login.body)}`);
    }
    
    adminToken = login.body.accessToken;
    
    if (!adminToken) {
      throw new Error('Token de admin não foi gerado');
    }
    
    // Cria propriedade para associar categoria
    const prop = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Fazenda Cat', description: 'Propriedade para categoria' });
    
    console.log('Criar propriedade:', prop.status, prop.body);
    
    if (prop.status !== 201) {
      throw new Error(`Falha ao criar propriedade: ${JSON.stringify(prop.body)}`);
    }
    
    propertyId = prop.body._id;
    propertySlug = prop.body.slug;
    
    if (!propertyId) {
      throw new Error('ID da propriedade não foi gerado');
    }
  } catch (error) {
    console.error('Erro no setup de teste:', error);
    throw error;
  }
});

afterAll(async () => {
  // Não precisamos mais limpar pastas locais
  await mongoose.disconnect();
});

describe('Categories API', () => {
  let categoryId = '';

  it('deve criar uma nova categoria', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Categoria Teste', description: 'Categoria de teste', property: propertyId });
    
    console.log('Criar categoria:', res.status, res.body);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Categoria Teste');
    categoryId = res.body._id;
  });

  it('deve listar categorias', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Listar categorias:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar categoria por id', async () => {
    const res = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Buscar categoria:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(categoryId);
  });

  it('deve atualizar uma categoria', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Categoria Atualizada', description: 'Atualizada', property: propertyId });
    
    console.log('Atualizar categoria:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Categoria Atualizada');
  });

  it('deve deletar uma categoria', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Deletar categoria:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/exclu/i);
  });
});
