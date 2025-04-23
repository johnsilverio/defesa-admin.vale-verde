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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../src/routes/index"));
const auth_1 = __importDefault(require("../src/routes/auth"));
const documents_1 = __importDefault(require("../src/routes/documents"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.MONGODB_URI = 'mongodb://localhost:27017/defesa-admin-test';
process.env.STORAGE_PATH = path_1.default.join(__dirname, 'test-uploads');
// Configuração completa do app como no server.ts real
const app = (0, express_1.default)();
// Middlewares essenciais
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Registra as rotas
app.use('/api', index_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/documents', documents_1.default);
// Adiciona middleware de erro para capturar erro 500 durante testes
app.use((err, req, res, next) => {
    console.error('ERRO NO TESTE:', err);
    res.status(500).json({ error: 'Erro interno', details: err.message });
});
let adminToken = '';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Conecta ao MongoDB e limpa o banco
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        yield mongoose_1.default.connection.dropDatabase();
        // Cria pasta de uploads para testes
        const fs = require('fs');
        if (!fs.existsSync(process.env.STORAGE_PATH)) {
            fs.mkdirSync(process.env.STORAGE_PATH, { recursive: true });
        }
        // Cria admin para autenticação
        const reg = yield (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send({ name: 'Admin', email: 'admin@admin.com', password: 'admin123', role: 'admin' });
        console.log('Registro admin:', reg.status, reg.body);
        if (reg.status !== 201) {
            throw new Error(`Falha ao registrar admin: ${JSON.stringify(reg.body)}`);
        }
        const login = yield (0, supertest_1.default)(app)
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
    }
    catch (error) {
        console.error('Erro no setup de teste:', error);
        throw error;
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Limpa recursos
    const fs = require('fs');
    const { rmSync } = fs;
    try {
        if (fs.existsSync(process.env.STORAGE_PATH)) {
            rmSync(process.env.STORAGE_PATH, { recursive: true, force: true });
        }
    }
    catch (e) {
        console.error('Erro ao limpar pasta de uploads:', e);
    }
    yield mongoose_1.default.disconnect();
}));
describe('Properties API', () => {
    let propertyId = '';
    it('deve criar uma nova propriedade', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Fazenda Teste', description: 'Propriedade de teste' });
        console.log('Criar propriedade:', res.status, res.body);
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Fazenda Teste');
        propertyId = res.body._id;
    }));
    it('deve listar propriedades', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get('/api/properties')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    }));
    it('deve buscar propriedade por id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get(`/api/properties/${propertyId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(propertyId);
    }));
    it('deve atualizar uma propriedade', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .put(`/api/properties/${propertyId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Fazenda Atualizada', description: 'Atualizada' });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Fazenda Atualizada');
    }));
    it('deve deletar uma propriedade', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .delete(`/api/properties/${propertyId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/exclu/i);
    }));
});
