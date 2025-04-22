import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente para os testes
dotenv.config();

// Configura a variável de ambiente para o modo de desenvolvimento para testes
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';

describe('Auth API - Login Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  // Usuários pré-configurados no sistema
  const userCredentials = {
    email: 'user@example.com',
    password: 'user123'
  };

  const adminCredentials1 = {
    email: 'paulo.martins@valeverdeambiental.com.br',
    password: '@valeverde2025'
  };

  const adminCredentials2 = {
    email: 'desenvolvimento@valeverdeambiental.com.br',
    password: '@valeverde123'
  };

  // Teste de login para usuário padrão
  test('should login with valid user credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(userCredentials);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('user');
  });

  // Teste de login para administrador Paulo Martins
  test('should login with valid admin credentials (Paulo)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(adminCredentials1);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });

  // Teste de login para administrador Desenvolvimento
  test('should login with valid admin credentials (Desenvolvimento)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(adminCredentials2);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });

  // Teste de login com credenciais inválidas
  test('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fail@example.com', password: 'wrong' });
    
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });
});
[{
	"resource": "/home/johnsilverio/Documents/Projects/defesa-admin-vv/api/tests/auth.test.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module 'supertest' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 1,
	"startColumn": 21,
	"endLineNumber": 1,
	"endColumn": 32
}]