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
const auth_1 = __importDefault(require("../src/routes/auth"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carrega variáveis de ambiente para os testes
dotenv_1.default.config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.MONGODB_URI = 'mongodb://localhost:27017/defesa-admin-test';
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.MONGODB_URI);
    yield mongoose_1.default.connection.dropDatabase();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
describe('Auth API', () => {
    const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'test1234',
    };
    let accessToken = '';
    let refreshToken = '';
    /** Registro de usuário */
    it('deve registrar um novo usuário', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(user);
        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe(user.email);
        expect(res.body.user.role).toBe('user');
    }));
    /** Login com usuário registrado */
    it('deve fazer login com usuário registrado', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: user.password });
        expect(res.statusCode).toBe(200);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user.email).toBe(user.email);
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
    }));
    /** Login com credenciais inválidas */
    it('não deve logar com senha errada', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'errada' });
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Credenciais inválidas');
    }));
    /** Validação de token */
    it('deve validar token de acesso', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get('/api/auth/validate')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.valid).toBe(true);
        expect(res.body.user.email).toBe(user.email);
    }));
    /** Refresh token */
    it('deve renovar o token de acesso', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/auth/refresh')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .send({ refreshToken });
        // Atualiza o refreshToken para o novo, caso precise ser usado em testes seguintes
        refreshToken = res.body.refreshToken;
        expect(res.statusCode).toBe(200);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
    }));
    /** Logout */
    it('deve realizar logout', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/auth/logout')
            .send({ refreshToken });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/logout/i);
    }));
});
