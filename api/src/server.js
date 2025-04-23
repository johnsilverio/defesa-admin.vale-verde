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
/**
 * Ponto de entrada da API DefesaAdmin.
 * Configura middlewares globais, rotas, tratamento de erros e inicializa o servidor Express.
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
const auth_1 = __importDefault(require("./routes/auth"));
const documents_1 = __importDefault(require("./routes/documents"));
// Carrega variáveis de ambiente
dotenv_1.default.config();
// Configuração do CORS
const app = (0, express_1.default)();
// Permitir múltiplos origens para CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://valeverde.defesa.vercel.app',
    'https://valeverdedefesa.vercel.app',
    // Adicione outros domínios conforme necessário
];
// Use a string do env se fornecida, ou a lista padrão
const originsString = process.env.CORS_ORIGIN || '';
const corsOrigins = originsString
    ? originsString.split(',')
    : allowedOrigins;
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permitir requisições sem origin (ex: mobile apps, curl)
        if (!origin)
            return callback(null, true);
        // Verificar se a origem está na lista de permitidos
        if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            console.log(`Origem bloqueada por CORS: ${origin}`);
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
    credentials: true,
    maxAge: 86400
}));
// Configura opções de cookie padrão para segurança
app.use((req, res, next) => {
    const originalCookie = res.cookie.bind(res);
    res.cookie = function (name, value, options = {}) {
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
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));
// Rotas para favicon.ico e favicon.png para evitar logs 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
app.get('/favicon.png', (req, res) => {
    res.status(204).end();
});
// Configuração de rate limits
const DISABLE_RATE_LIMITS = process.env.DISABLE_RATE_LIMITS === 'true' || process.env.NODE_ENV !== 'production';
const limiter = (0, express_rate_limit_1.default)({
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
    app.use('/api/auth/login', (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 5, // limite mais restrito para login
        message: {
            error: 'Muitas tentativas de login. Tente novamente após 15 minutos',
            code: 'LOGIN_ATTEMPTS_EXCEEDED'
        }
    }));
}
else {
    console.log('⚠️ Rate limiting desativado para desenvolvimento. NÃO USE EM PRODUÇÃO!');
}
// Middleware para parsear JSON e cookies
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || 'defesa-admin-secret'));
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
app.use('/api', routes_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/documents', documents_1.default);
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
const errorHandler = (err, req, res, next) => {
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
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defesa-admin';
        yield mongoose_1.default.connect(mongoURI);
        console.log('MongoDB conectado com sucesso');
    }
    catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
});
// Iniciar o servidor
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`API rodando na porta ${PORT}`);
        console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`CORS permitido para: ${corsOrigins.join(', ')}`);
        if (DISABLE_RATE_LIMITS) {
            console.log('⚠️ Rate limiting desativado');
        }
    });
});
