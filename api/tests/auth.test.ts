import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth';

describe('Auth API', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
  });

  it('should not register duplicate user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });
    expect(res.statusCode).toBe(409);
  });

  it('should login with valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fail@example.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
});
