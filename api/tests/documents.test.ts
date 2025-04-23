import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import routes from '../src/routes/index';
import authRouter from '../src/routes/auth';
import documentsRouter from '../src/routes/documents';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
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
  console.error('ERRO NO TESTE DOCUMENTO:', err);
  res.status(500).json({ error: 'Erro interno', details: err.message });
});

let adminToken = '';
let propertyId = '';
let propertySlug = '';
let categoryId = '';
let categorySlug = '';

beforeAll(async () => {
  try {
    // Conecta ao MongoDB e limpa o banco
    await mongoose.connect(process.env.MONGODB_URI!);
    await mongoose.connection.dropDatabase();
    
    // Garante arquivo de teste para upload (ainda precisamos disso para o teste)
    const testFilePath = path.join(__dirname, 'arquivo-teste.txt');
    fs.writeFileSync(testFilePath, 'conteudo de teste');
    
    // Cria admin
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin2@admin.com', password: 'admin123', role: 'admin' });
    
    console.log('Registro admin:', reg.status, reg.body);
    
    if (reg.status !== 201) {
      throw new Error(`Falha ao registrar admin: ${JSON.stringify(reg.body)}`);
    }
    
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin2@admin.com', password: 'admin123' });
    
    console.log('Login admin:', login.status, login.body);
    
    if (login.status !== 200) {
      throw new Error(`Falha ao fazer login: ${JSON.stringify(login.body)}`);
    }
    
    adminToken = login.body.accessToken;
    
    if (!adminToken) {
      throw new Error('Token de admin não foi gerado');
    }
    
    // Cria propriedade
    const prop = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Fazenda Doc', description: 'Propriedade para documento' });
    
    console.log('Criar propriedade:', prop.status, prop.body);
    
    if (prop.status !== 201) {
      throw new Error(`Falha ao criar propriedade: ${JSON.stringify(prop.body)}`);
    }
    
    propertySlug = prop.body.slug;
    propertyId = prop.body._id;
    
    if (!propertyId) {
      throw new Error('ID da propriedade não foi gerado');
    }
    
    // Cria categoria
    const cat = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Categoria Doc', description: 'Categoria para documento', property: propertyId });
    
    console.log('Criar categoria:', cat.status, cat.body);
    
    if (cat.status !== 201) {
      throw new Error(`Falha ao criar categoria: ${JSON.stringify(cat.body)}`);
    }
    
    categoryId = cat.body._id;
    categorySlug = cat.body.slug;
    
    if (!categoryId) {
      throw new Error('ID da categoria não foi gerado');
    }
  } catch (error) {
    console.error('Erro no setup de teste:', error);
    throw error;
  }
});

afterAll(async () => {
  // Remove arquivo de teste temporário
  const testFilePath = path.join(__dirname, 'arquivo-teste.txt');
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  
  await mongoose.disconnect();
});

describe('Documents API', () => {
  let documentId = '';
  const testFilePath = path.join(__dirname, 'arquivo-teste.txt');

  it('deve fazer upload de um novo documento', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Documento Teste')
      .field('description', 'Descrição do documento')
      .field('property', propertyId)
      .field('category', categoryId)
      .attach('file', testFilePath);
    
    console.log('Upload documento:', res.status, res.body);
    console.log('Caminho do arquivo:', res.body.filePath);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Documento Teste');
    
    // Armazenamos o ID do documento para os próximos testes
    documentId = res.body._id;
    console.log('ID do documento criado:', documentId);
    
    // O teste permite tanto o formato antigo quanto o novo para compatibilidade durante a transição
    const isValidFormat = 
      /^docs\/\d+_.+$/.test(res.body.filePath) || 
      /^documentos\/[^\/]+\/[^\/]+\/\d+_.+$/.test(res.body.filePath);
    
    expect(isValidFormat).toBe(true);
  });

  it('deve listar documentos', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Listar documentos:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar documento por id', async () => {
    expect(documentId).toBeTruthy(); // Garante que temos um ID válido
    
    const res = await request(app)
      .get(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Buscar documento por ID:', documentId);
    console.log('Resposta:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(documentId);
  });

  it('deve atualizar um documento', async () => {
    expect(documentId).toBeTruthy(); // Garante que temos um ID válido
    
    const res = await request(app)
      .put(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Documento Atualizado')
      .field('description', 'Atualizado')
      .field('property', propertyId)
      .field('category', categoryId);
    
    console.log('Atualizar documento:', documentId);
    console.log('Resposta:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Documento Atualizado');
  });

  // Movendo o teste de download para antes do delete
  it('deve gerar uma URL de download para um documento', async () => {
    expect(documentId).toBeTruthy(); // Garante que temos um ID válido
    
    const res = await request(app)
      .get(`/api/documents/${documentId}/download`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Download documento:', documentId);
    console.log('Resposta:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(typeof res.body.url).toBe('string');
  });

  it('deve deletar um documento', async () => {
    expect(documentId).toBeTruthy(); // Garante que temos um ID válido
    
    const res = await request(app)
      .delete(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Deletar documento:', documentId);
    console.log('Resposta:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
