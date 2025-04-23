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

dotenv.config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.MONGODB_URI = 'mongodb://localhost:27017/defesa-admin-test';
process.env.STORAGE_PATH = path.join(__dirname, 'test-uploads');

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
    
    // Cria pasta de uploads para testes
    if (!fs.existsSync(process.env.STORAGE_PATH!)) {
      fs.mkdirSync(process.env.STORAGE_PATH!, { recursive: true });
    }
    
    // Garante arquivo de teste
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
  // Remove arquivo de teste
  const testFilePath = path.join(__dirname, 'arquivo-teste.txt');
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  
  // Limpa pasta de uploads
  try {
    const { rmSync } = fs;
    if (fs.existsSync(process.env.STORAGE_PATH!)) {
      rmSync(process.env.STORAGE_PATH!, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Erro ao limpar pasta de uploads:', e);
  }
  
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
    
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Documento Teste');
    documentId = res.body._id;
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
    const res = await request(app)
      .get(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Buscar documento:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(documentId);
  });

  it('deve atualizar um documento', async () => {
    const res = await request(app)
      .put(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Documento Atualizado')
      .field('description', 'Atualizado')
      .field('property', propertyId)
      .field('category', categoryId);
    
    console.log('Atualizar documento:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Documento Atualizado');
  });

  it('deve deletar um documento', async () => {
    const res = await request(app)
      .delete(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    console.log('Deletar documento:', res.status, res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted|exclu/i);
  });
});
