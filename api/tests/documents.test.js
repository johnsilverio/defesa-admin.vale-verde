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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("../src/routes/index"));
const auth_1 = __importDefault(require("../src/routes/auth"));
const documents_1 = __importDefault(require("../src/routes/documents"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.MONGODB_URI = 'mongodb://localhost:27017/defesa-admin-test';
process.env.STORAGE_PATH = path_1.default.join(__dirname, 'test-uploads');

// Para garantir que os mocks serão aplicados no Node.js
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'mock-service-key';
process.env.SUPABASE_BUCKET = 'mock-bucket';

// Mock do módulo do Supabase para evitar o erro "supabaseUrl is required"
jest.mock('../src/services/supabaseService.js', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'mocked-path' }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://mock-supabase.com/signed-url' }, error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        list: jest.fn().mockResolvedValue({ data: [{ name: 'arquivo-mock.pdf' }], error: null })
      })
    }
  }
}), { virtual: true });

// Mock das funções do serviço de armazenamento com suporte ao novo formato de caminho
jest.mock('../src/services/storageService.js', () => ({
  uploadFile: jest.fn().mockImplementation(async (path) => {
    // Se o caminho não começar com 'documentos/', reescreva para o novo padrão
    const propertySlug = 'fazenda-doc';
    const categorySlug = 'categoria-doc';
    const fileName = path.split('/').pop();
    const timestamp = Date.now();
    const newPath = path.startsWith('documentos/') 
      ? path 
      : `documentos/${propertySlug}/${categorySlug}/${timestamp}_${fileName}`;
    console.log(`Mock uploadFile: ${path} -> ${newPath}`);
    return { path: newPath };
  }),
  getFileUrl: jest.fn().mockImplementation(async () => 'https://mock-supabase.com/signed-url'),
  deleteFile: jest.fn().mockImplementation(async () => {}),
  createFolder: jest.fn().mockImplementation(async (path) => ({ path: `${path}/.folder` })),
  folderExists: jest.fn().mockImplementation(async () => true),
  listFolderContents: jest.fn().mockImplementation(async () => [{ name: 'arquivo-mock.pdf', id: 'mock-id' }])
}));

// Os mocks do Supabase agora são gerenciados pelo arquivo jest.setup.js

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
    console.error('ERRO NO TESTE DOCUMENTO:', err);
    res.status(500).json({ error: 'Erro interno', details: err.message });
});
let adminToken = '';
let propertyId = '';
let propertySlug = '';
let categoryId = '';
let categorySlug = '';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Conecta ao MongoDB e limpa o banco
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        yield mongoose_1.default.connection.dropDatabase();
        // Cria pasta de uploads para testes
        if (!fs_1.default.existsSync(process.env.STORAGE_PATH)) {
            fs_1.default.mkdirSync(process.env.STORAGE_PATH, { recursive: true });
        }
        // Garante arquivo de teste
        const testFilePath = path_1.default.join(__dirname, 'arquivo-teste.txt');
        fs_1.default.writeFileSync(testFilePath, 'conteudo de teste');
        // Cria admin
        const reg = yield (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send({ name: 'Admin', email: 'admin2@admin.com', password: 'admin123', role: 'admin' });
        console.log('Registro admin:', reg.status, reg.body);
        if (reg.status !== 201) {
            throw new Error(`Falha ao registrar admin: ${JSON.stringify(reg.body)}`);
        }
        const login = yield (0, supertest_1.default)(app)
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
        const prop = yield (0, supertest_1.default)(app)
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
        const cat = yield (0, supertest_1.default)(app)
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
    }
    catch (error) {
        console.error('Erro no setup de teste:', error);
        throw error;
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Remove arquivo de teste
    const testFilePath = path_1.default.join(__dirname, 'arquivo-teste.txt');
    if (fs_1.default.existsSync(testFilePath))
        fs_1.default.unlinkSync(testFilePath);
    // Limpa pasta de uploads
    try {
        const { rmSync } = fs_1.default;
        if (fs_1.default.existsSync(process.env.STORAGE_PATH)) {
            rmSync(process.env.STORAGE_PATH, { recursive: true, force: true });
        }
    }
    catch (e) {
        console.error('Erro ao limpar pasta de uploads:', e);
    }
    yield mongoose_1.default.disconnect();
}));
describe('Documents API', () => {
    let documentId = '';
    const testFilePath = path_1.default.join(__dirname, 'arquivo-teste.txt');
    it('deve fazer upload de um novo documento', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
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
        documentId = res.body._id;
        console.log('ID do documento criado:', documentId);
        const isValidFormat = 
            /^docs\/\d+_.+$/.test(res.body.filePath) || 
            /^documentos\/[^\/]+\/[^\/]+\/\d+_.+$/.test(res.body.filePath);
        expect(isValidFormat).toBe(true);
    }));
    it('deve listar documentos', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get('/api/documents')
            .set('Authorization', `Bearer ${adminToken}`);
        console.log('Listar documentos:', res.status, res.body);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    }));
    it('deve buscar documento por id', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(documentId).toBeTruthy();
        const res = yield (0, supertest_1.default)(app)
            .get(`/api/documents/${documentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        console.log('Buscar documento por ID:', documentId);
        console.log('Resposta:', res.status, res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(documentId);
    }));
    it('deve atualizar um documento', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(documentId).toBeTruthy();
        const res = yield (0, supertest_1.default)(app)
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
    }));
    it('deve gerar uma URL de download para um documento', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(documentId).toBeTruthy();
        const res = yield (0, supertest_1.default)(app)
            .get(`/api/documents/${documentId}/download`)
            .set('Authorization', `Bearer ${adminToken}`);
        console.log('Download documento:', documentId);
        console.log('Resposta:', res.status, res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('url');
        expect(typeof res.body.url).toBe('string');
    }));
    it('deve deletar um documento', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(documentId).toBeTruthy();
        const res = yield (0, supertest_1.default)(app)
            .delete(`/api/documents/${documentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        console.log('Deletar documento:', documentId);
        console.log('Resposta:', res.status, res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body.success || res.body.message).toBeTruthy();
    }));
});
