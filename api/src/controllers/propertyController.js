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
exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getPropertyById = exports.getAllProperties = void 0;
const zod_1 = require("zod");
const property_1 = require("../models/property");
const slugify_1 = require("../utils/slugify");
const propertySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    description: zod_1.z.string().optional(),
    active: zod_1.z.boolean().optional()
});
/**
 * Lista todas as propriedades.
 * @route GET /api/properties
 */
const getAllProperties = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const properties = yield property_1.Property.find().sort({ name: 1 });
        res.json(properties);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProperties = getAllProperties;
/**
 * Busca uma propriedade pelo ID.
 * @route GET /api/properties/:id
 */
const getPropertyById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = yield property_1.Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        res.json(property);
    }
    catch (error) {
        next(error);
    }
});
exports.getPropertyById = getPropertyById;
/**
 * Cria uma nova propriedade.
 * @route POST /api/properties
 */
const createProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = propertySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: parseResult.error.format() });
        }
        const { name, description, active = true } = parseResult.data;
        const slug = (0, slugify_1.slugify)(name);
        const existingProperty = yield property_1.Property.findOne({ slug });
        if (existingProperty) {
            return res.status(409).json({ error: 'Já existe uma propriedade com este nome', code: 'PROPERTY_EXISTS' });
        }
        const property = new property_1.Property({ name, slug, description, active });
        yield property.save();
        res.status(201).json(property);
    }
    catch (error) {
        next(error);
    }
});
exports.createProperty = createProperty;
/**
 * Atualiza uma propriedade existente.
 * @route PUT /api/properties/:id
 */
const updateProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = propertySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: parseResult.error.format() });
        }
        const { name, description, active } = parseResult.data;
        const slug = (0, slugify_1.slugify)(name);
        const existingProperty = yield property_1.Property.findOne({ slug, _id: { $ne: req.params.id } });
        if (existingProperty) {
            return res.status(409).json({ error: 'Já existe uma propriedade com este nome', code: 'PROPERTY_EXISTS' });
        }
        const property = yield property_1.Property.findByIdAndUpdate(req.params.id, { name, slug, description, active, updatedAt: new Date() }, { new: true });
        if (!property) {
            return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        res.json(property);
    }
    catch (error) {
        next(error);
    }
});
exports.updateProperty = updateProperty;
/**
 * Remove uma propriedade.
 * @route DELETE /api/properties/:id
 */
const deleteProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = yield property_1.Property.findByIdAndDelete(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
        // Aqui poderia ser implementada a exclusão em cascata de categorias e documentos relacionados
        res.json({ message: 'Propriedade excluída com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProperty = deleteProperty;
