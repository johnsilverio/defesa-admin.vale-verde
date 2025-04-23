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
exports.FileService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const slugify_1 = require("../utils/slugify");
const mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
const unlink = (0, util_1.promisify)(fs_1.default.unlink);
const exists = (0, util_1.promisify)(fs_1.default.exists);
/**
 * Serviço para operações de arquivos no sistema.
 */
class FileService {
    constructor() {
        this.storagePath = process.env.STORAGE_PATH || path_1.default.join(process.cwd(), 'uploads');
        this.ensureStoragePathExists();
    }
    ensureStoragePathExists() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(yield exists(this.storagePath))) {
                    yield mkdir(this.storagePath, { recursive: true });
                }
            }
            catch (error) {
                throw new Error('Failed to create storage directory');
            }
        });
    }
    /**
     * Garante que os diretórios de propriedade e categoria existem.
     */
    ensureDirectoryExists(propertySlug, categorySlug) {
        return __awaiter(this, void 0, void 0, function* () {
            const propertyPath = path_1.default.join(this.storagePath, propertySlug);
            const categoryPath = path_1.default.join(propertyPath, categorySlug);
            try {
                if (!(yield exists(propertyPath))) {
                    yield mkdir(propertyPath, { recursive: true });
                }
                if (!(yield exists(categoryPath))) {
                    yield mkdir(categoryPath, { recursive: true });
                }
            }
            catch (error) {
                throw new Error(`Falha ao criar diretórios. Verifique as permissões em ${this.storagePath}`);
            }
        });
    }
    /**
     * Move um arquivo dentro do storage.
     */
    moveFile(oldRelativePath, newRelativePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldFullPath = path_1.default.join(this.storagePath, oldRelativePath);
            const newFullPath = path_1.default.join(this.storagePath, newRelativePath);
            try {
                if (!(yield exists(oldFullPath))) {
                    throw new Error(`Arquivo de origem não encontrado: ${oldFullPath}`);
                }
                const newDir = path_1.default.dirname(newFullPath);
                if (!(yield exists(newDir))) {
                    yield mkdir(newDir, { recursive: true });
                }
                const fileData = yield fs_1.default.promises.readFile(oldFullPath);
                yield fs_1.default.promises.writeFile(newFullPath, fileData);
                yield unlink(oldFullPath);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                throw new Error(`Falha ao mover arquivo: ${errorMessage}`);
            }
        });
    }
    /**
     * Salva um arquivo no diretório correto.
     */
    saveFile(file, propertySlug, categorySlug, customFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                propertySlug = propertySlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                categorySlug = categorySlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                yield this.ensureDirectoryExists(propertySlug, categorySlug);
                const normalizedFileName = customFileName ?
                    (0, slugify_1.normalizeFileName)(customFileName) :
                    (0, slugify_1.normalizeFileName)(file.originalname);
                const filePath = path_1.default.join(this.storagePath, propertySlug, categorySlug, normalizedFileName);
                yield writeFile(filePath, file.buffer);
                return {
                    fileName: normalizedFileName,
                    filePath: path_1.default.join(propertySlug, categorySlug, normalizedFileName)
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                throw new Error(`Falha ao salvar arquivo: ${errorMessage}`);
            }
        });
    }
    /**
     * Exclui um arquivo do storage.
     */
    deleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = path_1.default.join(this.storagePath, filePath);
            try {
                if (yield exists(fullPath)) {
                    yield unlink(fullPath);
                }
            }
            catch (error) {
                throw new Error('Failed to delete file');
            }
        });
    }
    /**
     * Retorna o caminho absoluto de um arquivo.
     */
    getFullPath(filePath) {
        return path_1.default.join(this.storagePath, filePath);
    }
    /**
     * Retorna o diretório base de storage.
     */
    getStoragePath() {
        return this.storagePath;
    }
}
exports.FileService = FileService;
