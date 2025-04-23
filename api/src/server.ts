/**
 * Ponto de entrada da API DefesaAdmin.
 * Configura middlewares globais, rotas, tratamento de erros e inicializa o servidor Express.
 */
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import routes from './routes';
import authRouter from './routes/auth';
import documentsRouter from './routes/documents';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do CORS
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
  credentials: true,
  maxAge: 86400
}));

// Configura opções de cookie padrão para segurança
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  
  res.cookie = function(name: string, value: string, options: any = {}) {
    const defaultOptions = {
      httpOnly: options.httpOnly !== false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: options.sameSite || 'lax'
    };
    
    return originalCookie(name, value, Object.assign({}, defaultOptions, options));
  };
  
  next();
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// Rota para favicon.ico e favicon.png para evitar logs 404
app.get(['/favicon.ico', '/favicon.png'], (req, res) => res.status(204).end());
// Configuração de rate limits
const DISABLE_RATE_LIMITS = process.env.DISABLE_RATE_LIMITS === 'true' || process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: DISABLE_RATE_LIMITS ? 1000000 : 100,
  standardHeaders: true,
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Aplicar limitador nas rotas de autenticação apenas em produção
if (!DISABLE_RATE_LIMITS) {
  app.use('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // limite mais restrito para login
    message: {
      error: 'Muitas tentativas de login. Tente novamente após 15 minutos',
      code: 'LOGIN_ATTEMPTS_EXCEEDED'
    }
  }));
} else {
  console.log('⚠️ Rate limiting desativado para desenvolvimento. NÃO USE EM PRODUÇÃO!');
}

// Middleware para parsear JSON e cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'defesa-admin-secret'));

// Remova essa linha que está causando o erro em ambientes serverless
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log de requisições em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Registrar rotas
app.use('/api', routes);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

// Rota principal
app.get('/', (req, res) => {
  res.json({
    name: 'API Vale Verde',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  // Tratamento especial para rotas de API específicas
  const apiPaths = ['/documents', '/categories', '/properties'];
  if (apiPaths.some(path => req.originalUrl.includes(path)) && req.method === 'GET') {
    console.log(`Rota não encontrada: ${req.originalUrl}. Corrigindo para /api${req.originalUrl}`);
    if (!req.originalUrl.startsWith('/api')) {
      return res.redirect(`/api${req.originalUrl}`);
    }
  }
  
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'NOT_FOUND'
  });
});

// Middleware para tratamento de erros
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'JSON inválido',
      code: 'INVALID_JSON'
    });
    return;
  }
  
  // Resposta genérica para outros erros
  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
};

app.use(errorHandler);

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defesa-admin';
    await mongoose.connect(mongoURI);
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

// Iniciar o servidor
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS permitido para: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    if (DISABLE_RATE_LIMITS) {
      console.log('⚠️ Rate limiting desativado');
    }
  });
});
