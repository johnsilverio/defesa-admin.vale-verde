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
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadDocument = exports.deleteDocument = exports.updateDocument = exports.createDocument = exports.getDocumentById = exports.getAllDocuments = void 0;
const zod_1 = require("zod");
const document_1 = require("../models/document");
const category_1 = require("../models/category");
const property_1 = require("../models/property");
const slugify_1 = require("../utils/slugify");
const storageService_1 = require("../services/storageService");
// (Se precisar do upload, importar de '../middlewares/upload')
const documentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, 'Categoria é obrigatória'),
    property: zod_1.z.string().min(1, 'Propriedade é obrigatória'),
    isHighlighted: zod_1.z.boolean().optional().default(false)
});
/**
 * Lista documentos com filtros opcionais.
 * @route GET /api/documents
 */
const getAllDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, property, search, isHighlighted } = req.query;
        let filter = {};
        if (category)
            filter.category = category;
        if (property)
            filter.property = property;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (isHighlighted !== undefined)
            filter.isHighlighted = isHighlighted === 'true';
        const documents = yield document_1.Document.find(filter)
            .populate('category', 'name slug')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(documents);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllDocuments = getAllDocuments;
/**
 * Busca um documento pelo ID.
 * @route GET /api/documents/:id
 */
const getDocumentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield document_1.Document.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('uploadedBy', 'name email');
        if (!document) {
            return res.status(404).json({ error: 'Documento não encontrado' });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getDocumentById = getDocumentById;
/**
 * Cria um novo documento com upload de arquivo.
 * @route POST /api/documents
 */
const createDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, description, category: categoryId, property: propertyId, isHighlighted } = req.body;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!req.file)
            return res.status(400).json({ error: 'Arquivo é obrigatório' });
        // Obter informações da categoria e propriedade para construir o caminho correto
        const category = yield category_1.Category.findById(categoryId);
        const property = yield property_1.Property.findById(propertyId);
        if (!category || !property) {
            return res.status(400).json({
                error: 'Categoria ou propriedade inválida',
                details: !category ? 'Categoria não encontrada' : 'Propriedade não encontrada'
            });
        }
        // Construir o caminho correto no formato documentos/nome-da-propriedade/nome-categoria
        const normalizedFileName = (0, slugify_1.normalizeFileName)(req.file.originalname);
        const timestamp = Date.now();
        const filePath = `documentos/${property.slug}/${category.slug}/${timestamp}_${normalizedFileName}`;
        yield (0, storageService_1.uploadFile)(filePath, req.file.buffer, req.file.mimetype);
        const document = new document_1.Document({
            title,
            description,
            category: categoryId,
            property: propertyId,
            isHighlighted: !!isHighlighted,
            fileName: normalizedFileName,
            originalFileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            filePath,
            uploadedBy: userId
        });
        yield document.save();
        res.status(201).json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.createDocument = createDocument;
/**
 * Atualiza um documento existente.
 * @route PUT /api/documents/:id
 */
const updateDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, category: categoryId, property: propertyId, isHighlighted } = req.body;
        const document = yield document_1.Document.findById(req.params.id);
        if (!document)
            return res.status(404).json({ error: 'Documento não encontrado' });
        // Se houver novo arquivo ou mudança de categoria/propriedade
        if (req.file ||
            (categoryId && categoryId !== document.category.toString()) ||
            (propertyId && propertyId !== document.property.toString())) {
            // Buscar informações atualizadas de categoria e propriedade
            const category = yield category_1.Category.findById(categoryId || document.category);
            const property = yield property_1.Property.findById(propertyId || document.property);
            if (!category || !property) {
                return res.status(400).json({
                    error: 'Categoria ou propriedade inválida',
                    details: !category ? 'Categoria não encontrada' : 'Propriedade não encontrada'
                });
            }
            // Se houver novo arquivo
            if (req.file) {
                // Remove arquivo antigo do Supabase
                if (document.filePath) {
                    yield (0, storageService_1.deleteFile)(document.filePath);
                }
                const normalizedFileName = (0, slugify_1.normalizeFileName)(req.file.originalname);
                const timestamp = Date.now();
                const filePath = `documentos/${property.slug}/${category.slug}/${timestamp}_${normalizedFileName}`;
                yield (0, storageService_1.uploadFile)(filePath, req.file.buffer, req.file.mimetype);
                document.fileName = normalizedFileName;
                document.originalFileName = req.file.originalname;
                document.fileSize = req.file.size;
                document.fileType = req.file.mimetype;
                document.filePath = filePath;
            }
            // Se apenas a categoria ou propriedade mudou, mover o arquivo para o novo local
            else if ((categoryId && categoryId !== document.category.toString()) ||
                (propertyId && propertyId !== document.property.toString())) {
                // Implementar a movimentação do arquivo no Supabase em uma versão futura
                // Por enquanto, notificamos que o arquivo permanece no local original
                console.log('Aviso: A mudança de categoria/propriedade não move automaticamente os arquivos existentes');
            }
        }
        if (title)
            document.title = title;
        if (description !== undefined)
            document.description = description;
        if (categoryId)
            document.category = categoryId;
        if (propertyId)
            document.property = propertyId;
        if (isHighlighted !== undefined)
            document.isHighlighted = isHighlighted;
        yield document.save();
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.updateDocument = updateDocument;
/**
 * Remove um documento.
 * @route DELETE /api/documents/:id
 */
const deleteDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield document_1.Document.findById(req.params.id);
        if (!document)
            return res.status(404).json({ error: 'Documento não encontrado' });
        // Remove arquivo do Supabase
        if (document.filePath) {
            yield (0, storageService_1.deleteFile)(document.filePath);
        }
        yield document.deleteOne();
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteDocument = deleteDocument;
/**
 * Download de um documento.
 * @route GET /api/documents/:id/download
 */
const downloadDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield document_1.Document.findById(req.params.id);
        if (!document)
            return res.status(404).json({ error: 'Documento não encontrado' });
        // Gera URL temporário do Supabase
        const url = yield (0, storageService_1.getFileUrl)(document.filePath);
        res.json({ url });
    }
    catch (error) {
        next(error);
    }
});
exports.downloadDocument = downloadDocument;
