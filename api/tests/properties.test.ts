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
  console.error('ERRO NO TESTE:', err);
  res.status(500).json({ error: 'Erro interno', details: err.message });
});

let adminToken = '';

beforeAll(async () => {
  try {
    // Conecta ao MongoDB e limpa o banco
    await mongoose.connect(process.env.MONGODB_URI!);
    await mongoose.connection.dropDatabase();
    
    // Cria pasta de uploads para testes
    const fs = require('fs');
    if (!fs.existsSync(process.env.STORAGE_PATH!)) {
      fs.mkdirSync(process.env.STORAGE_PATH!, { recursive: true });
    }
    
    // Cria admin para autenticação
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@admin.com', password: 'admin123', role: 'admin' });
    
    console.log('Registro admin:', reg.status, reg.body);
    
    if (reg.status !== 201) {
      throw new Error(`Falha ao registrar admin: ${JSON.stringify(reg.body)}`);
    }
    
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@admin.com', password: 'admin123' });
    
    console.log('Login admin:', login.status, login.body);
    
    if (login.status !== 200) {
      throw new Error(`Falha ao fazer login: ${JSON.stringify(login.body)}`);
    }
    
    adminToken = login.body.accessToken;
    
    if (!adminToken) {
      throw new Error('Token de admin não foi gerado');
    }
  } catch (error) {
    console.error('Erro no setup de teste:', error);
    throw error;
  }
});

afterAll(async () => {
  // Limpa recursos
  const fs = require('fs');
  const { rmSync } = fs;
  try {
    if (fs.existsSync(process.env.STORAGE_PATH!)) {
      rmSync(process.env.STORAGE_PATH!, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Erro ao limpar pasta de uploads:', e);
  }
  
  await mongoose.disconnect();
});

describe('Properties API', () => {
  let propertyId = '';

  it('deve criar uma nova propriedade', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Fazenda Teste', description: 'Propriedade de teste' });
    
    console.log('Criar propriedade:', res.status, res.body);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Fazenda Teste');
    propertyId = res.body._id;
  });

  it('deve listar propriedades', async () => {
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve buscar propriedade por id', async () => {
    const res = await request(app)
      .get(`/api/properties/${propertyId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(propertyId);
  });

  it('deve atualizar uma propriedade', async () => {
    const res = await request(app)
      .put(`/api/properties/${propertyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Fazenda Atualizada', description: 'Atualizada' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Fazenda Atualizada');
  });

  it('deve deletar uma propriedade', async () => {
    const res = await request(app)
      .delete(`/api/properties/${propertyId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/exclu/i);
  });
});
