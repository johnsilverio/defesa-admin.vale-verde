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
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../models/user");
const property_1 = require("../models/property");
const category_1 = require("../models/category");
const slugify_1 = require("../utils/slugify");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storageService_1 = require("../services/storageService");
// Load environment variables
dotenv_1.default.config();
// Verifique se está rodando em ambiente serverless (Vercel)
const isServerlessEnvironment = process.env.VERCEL === '1';
// Verifica se o Supabase está configurado
const isSupabaseConfigured = process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_KEY &&
    process.env.SUPABASE_BUCKET;
// Configuration options with defaults
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/defesa-admin',
    STORAGE_PATH: process.env.STORAGE_PATH || path_1.default.join(process.cwd(), 'uploads'),
    PROPERTY_NAME: process.env.PROPERTY_NAME || 'Fazenda Brilhante',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'desenvolvimento@valeverdeambiental.com.br',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '@valeverde123',
    ADMIN_NAME: process.env.ADMIN_NAME || 'Desenvolvimento',
};
/**
 * Script de configuração inicial do sistema DefesaAdmin.
 * Cria propriedade, categorias padrão, usuário admin e estrutura de pastas.
 */
function runSetup() {
    return __awaiter(this, void 0, void 0, function* () {
        let connection = null;
        try {
            console.log('🚀 Iniciando configuração do sistema DefesaAdmin...');
            console.log('🔧 Verificando ambiente...');
            console.log(`📊 URL do MongoDB: ${CONFIG.MONGODB_URI}`);
            // Verifica configuração do Supabase
            if (isSupabaseConfigured) {
                console.log(`🔵 Supabase configurado: ${process.env.SUPABASE_URL}`);
                console.log(`🔵 Bucket: ${process.env.SUPABASE_BUCKET}`);
            }
            else {
                console.log('⚠️ Supabase não configurado! Configure as variáveis SUPABASE_URL, SUPABASE_SERVICE_KEY e SUPABASE_BUCKET');
                if (!isServerlessEnvironment) {
                    console.log(`📁 Usando armazenamento local em: ${CONFIG.STORAGE_PATH}`);
                }
                else {
                    console.error('❌ Em ambiente serverless, a configuração do Supabase é obrigatória!');
                    return false;
                }
            }
            // Connect to MongoDB
            console.log('\n🔌 Conectando ao MongoDB...');
            yield mongoose_1.default.connect(CONFIG.MONGODB_URI);
            connection = mongoose_1.default.connection;
            console.log('✅ MongoDB conectado com sucesso');
            // Setup storage directory - apenas para ambiente não-serverless e sem Supabase
            if (!isServerlessEnvironment && !isSupabaseConfigured) {
                if (!fs_1.default.existsSync(CONFIG.STORAGE_PATH)) {
                    fs_1.default.mkdirSync(CONFIG.STORAGE_PATH, { recursive: true });
                    console.log(`✅ Diretório de armazenamento local criado em ${CONFIG.STORAGE_PATH}`);
                }
                else {
                    console.log(`ℹ️ Diretório de armazenamento local já existe em ${CONFIG.STORAGE_PATH}`);
                }
            }
            // Remove outros admins antes de criar o admin desejado
            console.log(`\n🧹 Removendo administradores antigos...`);
            yield user_1.User.deleteMany({ email: { $ne: CONFIG.ADMIN_EMAIL }, role: 'admin' });
            console.log(`✅ Admins antigos removidos (exceto ${CONFIG.ADMIN_EMAIL})`);
            // Setup property
            console.log(`\n📋 Configurando propriedade "${CONFIG.PROPERTY_NAME}"...`);
            const propertySlug = (0, slugify_1.slugify)(CONFIG.PROPERTY_NAME);
            let property = yield property_1.Property.findOne({ slug: propertySlug });
            if (!property) {
                property = new property_1.Property({
                    name: CONFIG.PROPERTY_NAME,
                    slug: propertySlug,
                    description: 'Propriedade principal do sistema',
                    active: true
                });
                yield property.save();
                console.log(`✅ Propriedade "${CONFIG.PROPERTY_NAME}" criada com sucesso`);
            }
            else {
                console.log(`ℹ️ Propriedade "${CONFIG.PROPERTY_NAME}" já existe`);
            }
            // Setup default categories
            console.log('\n📋 Configurando categorias padrão...');
            const defaultCategories = [
                { name: 'Defesa Administrativa', description: 'Documentos relacionados à defesa administrativa' },
                { name: 'Documentos de Propriedade', description: 'Escrituras, matrículas e outros documentos de propriedade' },
                { name: 'Processos Judiciais', description: 'Documentos relacionados a processos judiciais' },
                { name: 'Estudos Antropológicos', description: 'Estudos e relatórios antropológicos' },
                { name: 'Legislação', description: 'Leis, decretos e normativas relevantes' }
            ];
            for (const catData of defaultCategories) {
                const categorySlug = (0, slugify_1.slugify)(catData.name);
                const existingCategory = yield category_1.Category.findOne({
                    property: propertySlug,
                    slug: categorySlug
                });
                if (!existingCategory) {
                    const category = new category_1.Category({
                        name: catData.name,
                        slug: categorySlug,
                        description: catData.description,
                        property: propertySlug
                    });
                    yield category.save();
                    console.log(`✅ Categoria "${catData.name}" criada com sucesso`);
                }
                else {
                    console.log(`ℹ️ Categoria "${catData.name}" já existe`);
                }
            }
            // Setup admin user
            console.log(`\n📋 Configurando usuário administrador (${CONFIG.ADMIN_EMAIL})...`);
            let admin = yield user_1.User.findOne({ email: CONFIG.ADMIN_EMAIL });
            if (!admin) {
                admin = new user_1.User({
                    name: CONFIG.ADMIN_NAME,
                    email: CONFIG.ADMIN_EMAIL,
                    password: CONFIG.ADMIN_PASSWORD,
                    role: 'admin',
                    properties: [property._id]
                });
                yield admin.save();
                console.log(`✅ Usuário admin (${CONFIG.ADMIN_EMAIL}) criado com sucesso`);
            }
            else {
                // Atualiza dados caso já exista
                admin.name = CONFIG.ADMIN_NAME;
                admin.password = CONFIG.ADMIN_PASSWORD;
                admin.role = 'admin';
                admin.properties = [property._id];
                yield admin.save();
                console.log(`ℹ️ Usuário admin (${CONFIG.ADMIN_EMAIL}) já existia e foi atualizado`);
            }
            // Configuração de estrutura de pastas
            console.log('\n📋 Configurando estrutura de pastas...');
            if (isSupabaseConfigured) {
                // Criação da estrutura no Supabase
                console.log('🔷 Criando estrutura no Supabase...');
                // Pasta para a propriedade
                const supabasePropertyPath = `${propertySlug}`;
                yield (0, storageService_1.createFolder)(supabasePropertyPath);
                console.log(`✅ Pasta da propriedade criada/verificada: ${supabasePropertyPath}`);
                // Pastas para as categorias
                for (const catData of defaultCategories) {
                    const categorySlug = (0, slugify_1.slugify)(catData.name);
                    const categoryPath = `${supabasePropertyPath}/${categorySlug}`;
                    yield (0, storageService_1.createFolder)(categoryPath);
                    console.log(`✅ Pasta de categoria criada/verificada: ${categoryPath}`);
                }
            }
            else if (!isServerlessEnvironment) {
                // Criação da estrutura local (apenas em ambiente não-serverless)
                const localDocumentsDir = path_1.default.join(CONFIG.STORAGE_PATH, 'documentos');
                if (!fs_1.default.existsSync(localDocumentsDir)) {
                    fs_1.default.mkdirSync(localDocumentsDir, { recursive: true });
                }
                console.log(`✅ Diretório raiz "documentos" criado: ${localDocumentsDir}`);
                const propertyDir = path_1.default.join(localDocumentsDir, propertySlug);
                if (!fs_1.default.existsSync(propertyDir)) {
                    fs_1.default.mkdirSync(propertyDir, { recursive: true });
                    console.log(`✅ Diretório da propriedade criado: ${propertyDir}`);
                }
                for (const catData of defaultCategories) {
                    const categorySlug = (0, slugify_1.slugify)(catData.name);
                    const categoryDir = path_1.default.join(propertyDir, categorySlug);
                    if (!fs_1.default.existsSync(categoryDir)) {
                        fs_1.default.mkdirSync(categoryDir, { recursive: true });
                        console.log(`✅ Diretório de categoria criado: ${categoryDir}`);
                    }
                }
            }
            else {
                console.log('⚠️ Pulando criação de estrutura de armazenamento - Configure o Supabase para ambiente serverless');
            }
            console.log('\n✨ Configuração concluída com sucesso! O sistema está pronto para uso.');
            console.log(`🔐 Use as credenciais de administrador (${CONFIG.ADMIN_EMAIL}) para fazer login no sistema.`);
            return true;
        }
        catch (error) {
            console.error('\n❌ Erro durante a configuração:', error);
            return false;
        }
        finally {
            // Close MongoDB connection
            if (connection) {
                yield mongoose_1.default.disconnect();
                console.log('🔌 Conexão com o MongoDB encerrada');
            }
        }
    });
}
// Run the setup
runSetup()
    .then(success => {
    process.exit(success ? 0 : 1);
})
    .catch(error => {
    console.error('Erro fatal durante a execução do script:', error);
    process.exit(1);
});
