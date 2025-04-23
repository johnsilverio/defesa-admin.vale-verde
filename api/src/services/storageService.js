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
exports.uploadFile = uploadFile;
exports.getFileUrl = getFileUrl;
exports.deleteFile = deleteFile;
exports.folderExists = folderExists;
exports.createFolder = createFolder;
exports.listFolderContents = listFolderContents;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabaseService_1 = require("./supabaseService");
// Determinação do modo de armazenamento
const isVercelEnvironment = process.env.VERCEL === '1';
const bucket = process.env.SUPABASE_BUCKET;
const localStoragePath = process.env.STORAGE_PATH || './uploads';
// Verifica se o Supabase está configurado e se estamos em ambiente serverless (Vercel)
const useSupabaseStorage = !!supabaseService_1.supabase && (isVercelEnvironment || !fs_1.default.existsSync(localStoragePath));
console.log(`ℹ️ Modo de armazenamento: ${useSupabaseStorage ? 'Supabase' : 'Sistema de arquivos local'}`);
/**
 * Faz upload de um arquivo, seja para o Supabase ou sistema de arquivos local
 */
function uploadFile(filePath, fileBuffer, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useSupabaseStorage) {
            if (!supabaseService_1.supabase || !bucket) {
                throw new Error('Supabase não está configurado corretamente para upload de arquivos');
            }
            const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).upload(filePath, fileBuffer, {
                contentType,
                upsert: true,
            });
            if (error)
                throw error;
            return data;
        }
        else {
            // Upload para sistema de arquivos local
            const fullPath = path_1.default.join(localStoragePath, filePath);
            const directory = path_1.default.dirname(fullPath);
            // Garante que o diretório existe
            if (!fs_1.default.existsSync(directory)) {
                fs_1.default.mkdirSync(directory, { recursive: true });
            }
            // Escreve o arquivo
            fs_1.default.writeFileSync(fullPath, fileBuffer);
            return { path: filePath };
        }
    });
}
/**
 * Obtém a URL de um arquivo para download
 */
function getFileUrl(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useSupabaseStorage) {
            if (!supabaseService_1.supabase || !bucket) {
                throw new Error('Supabase não está configurado corretamente para obter URLs');
            }
            const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60); // 1h
            if (error)
                throw error;
            return data.signedUrl;
        }
        else {
            // Para desenvolvimento local, retorna o caminho relativo
            return `/api/uploads/${filePath}`;
        }
    });
}
/**
 * Exclui um arquivo
 */
function deleteFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useSupabaseStorage) {
            if (!supabaseService_1.supabase || !bucket) {
                throw new Error('Supabase não está configurado corretamente para exclusão de arquivos');
            }
            const { error } = yield supabaseService_1.supabase.storage.from(bucket).remove([filePath]);
            if (error)
                throw error;
        }
        else {
            // Exclusão do sistema de arquivos local
            const fullPath = path_1.default.join(localStoragePath, filePath);
            if (fs_1.default.existsSync(fullPath)) {
                fs_1.default.unlinkSync(fullPath);
            }
        }
    });
}
/**
 * Verifica se uma pasta existe
 */
function folderExists(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useSupabaseStorage) {
            if (!supabaseService_1.supabase || !bucket) {
                throw new Error('Supabase não está configurado corretamente para verificar pastas');
            }
            const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).list(folderPath);
            if (error)
                throw error;
            return data && data.length > 0;
        }
        else {
            // Verificação no sistema de arquivos local
            const fullPath = path_1.default.join(localStoragePath, folderPath);
            return fs_1.default.existsSync(fullPath) && fs_1.default.statSync(fullPath).isDirectory();
        }
    });
}
/**
 * Cria uma pasta
 */
function createFolder(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useSupabaseStorage) {
            if (!supabaseService_1.supabase || !bucket) {
                throw new Error('Supabase não está configurado corretamente para criar pastas');
            }
            // Certifique-se de que o caminho termina com /
            const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
            // Cria um arquivo vazio para simular uma pasta
            const emptyBuffer = Buffer.from('');
            const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).upload(`${normalizedPath}.folder`, emptyBuffer, {
                contentType: 'application/x-directory',
                upsert: true
            });
            if (error)
                throw error;
            return data;
        }
        else {
            // Criação de pasta no sistema de arquivos local
            const fullPath = path_1.default.join(localStoragePath, folderPath);
            if (!fs_1.default.existsSync(fullPath)) {
                fs_1.default.mkdirSync(fullPath, { recursive: true });
            }
            return { path: folderPath };
        }
    });
}
/**
 * Lista conteúdo de uma pasta
 */
function listFolderContents(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useSupabaseStorage) {
            if (!supabaseService_1.supabase || !bucket) {
                throw new Error('Supabase não está configurado corretamente para listar conteúdo de pastas');
            }
            const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).list(folderPath);
            if (error)
                throw error;
            return data;
        }
        else {
            // Listagem no sistema de arquivos local
            const fullPath = path_1.default.join(localStoragePath, folderPath);
            if (!fs_1.default.existsSync(fullPath))
                return [];
            const files = fs_1.default.readdirSync(fullPath);
            return files.map(file => ({
                name: file,
                id: file,
                metadata: {
                    size: fs_1.default.statSync(path_1.default.join(fullPath, file)).size,
                    mimetype: path_1.default.extname(file) || 'unknown'
                }
            }));
        }
    });
}
