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
exports.downloadDocument = exports.deleteDocument = exports.updateDocument = exports.createDocument = exports.getDocumentById = exports.getAllDocuments = void 0;
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const document_1 = require("../models/document");
const category_1 = require("../models/category");
const property_1 = require("../models/property");
const fileService_1 = require("../services/fileService");
const fileService = new fileService_1.FileService();
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
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Arquivo não fornecido', code: 'FILE_REQUIRED' });
        }
        if (typeof req.body.isHighlighted === 'string') {
            req.body.isHighlighted = req.body.isHighlighted === 'true';
        }
        const parseResult = documentSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: parseResult.error.format() });
        }
        const { title, description, category, property, isHighlighted } = parseResult.data;
        const propertyExists = yield property_1.Property.findOne({ $or: [{ _id: property }, { slug: property }] });
        if (!propertyExists) {
            return res.status(404).json({ error: 'Propriedade não encontrada', code: 'PROPERTY_NOT_FOUND' });
        }
        const categoryExists = yield category_1.Category.findOne({ $or: [{ _id: category }, { slug: category }], property: propertyExists.slug });
        if (!categoryExists) {
            return res.status(404).json({ error: 'Categoria não encontrada', code: 'CATEGORY_NOT_FOUND' });
        }
        try {
            const { fileName, filePath } = yield fileService.saveFile(req.file, propertyExists.slug, categoryExists.slug);
            const document = new document_1.Document({
                title,
                description,
                fileName,
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                fileType: req.file.mimetype,
                filePath,
                category: categoryExists._id,
                property: propertyExists.slug,
                uploadedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                isHighlighted: isHighlighted || false
            });
            yield document.save();
            res.status(201).json(document);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return res.status(500).json({ error: 'Falha ao salvar o arquivo', details: errorMessage });
        }
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
        if (typeof req.body.isHighlighted === 'string') {
            req.body.isHighlighted = req.body.isHighlighted === 'true';
        }
        const parseResult = documentSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid data', details: parseResult.error.format() });
        }
        const { title, description, category, property, isHighlighted } = parseResult.data;
        const existingDocument = yield document_1.Document.findById(req.params.id);
        if (!existingDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const propertyExists = yield property_1.Property.findOne({ $or: [{ _id: property }, { slug: property }] });
        if (!propertyExists) {
            return res.status(404).json({ error: 'Property not found', code: 'PROPERTY_NOT_FOUND' });
        }
        const categoryExists = yield category_1.Category.findOne({ $or: [{ _id: category }, { slug: category }], property: propertyExists.slug });
        if (!categoryExists) {
            return res.status(404).json({ error: 'Category not found', code: 'CATEGORY_NOT_FOUND' });
        }
        const updateData = {
            title,
            description,
            category: categoryExists._id,
            property: propertyExists.slug,
            isHighlighted: isHighlighted || false,
            updatedAt: new Date()
        };
        if (req.file) {
            try {
                yield fileService.ensureDirectoryExists(propertyExists.slug, categoryExists.slug);
                yield fileService.deleteFile(existingDocument.filePath);
                const { fileName, filePath } = yield fileService.saveFile(req.file, propertyExists.slug, categoryExists.slug);
                updateData.fileName = fileName;
                updateData.originalFileName = req.file.originalname;
                updateData.fileSize = req.file.size;
                updateData.fileType = req.file.mimetype;
                updateData.filePath = filePath;
            }
            catch (fileError) {
                const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
                return res.status(500).json({ error: 'Failed to process file', details: errorMessage });
            }
        }
        else if (existingDocument.category.toString() !== categoryExists._id.toString()) {
            try {
                yield fileService.ensureDirectoryExists(propertyExists.slug, categoryExists.slug);
                const oldFilePath = existingDocument.filePath;
                const fileName = path_1.default.basename(oldFilePath);
                const newFilePath = path_1.default.join(propertyExists.slug, categoryExists.slug, fileName);
                yield fileService.moveFile(oldFilePath, newFilePath);
                updateData.filePath = newFilePath;
            }
            catch (moveError) {
                const errorMessage = moveError instanceof Error ? moveError.message : 'Unknown error';
                return res.status(500).json({ error: 'Failed to move file to new category', details: errorMessage });
            }
        }
        const updatedDocument = yield document_1.Document.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category', 'name slug')
            .populate('uploadedBy', 'name email');
        res.json(updatedDocument);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to update document', details: errorMessage });
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
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        yield fileService.deleteFile(document.filePath);
        yield document_1.Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to delete document', details: errorMessage });
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
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const filePath = fileService.getFullPath(document.filePath);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'Arquivo não encontrado' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
        res.setHeader('Content-Type', document.fileType);
        res.sendFile(filePath);
    }
    catch (error) {
        next(error);
    }
});
exports.downloadDocument = downloadDocument;
