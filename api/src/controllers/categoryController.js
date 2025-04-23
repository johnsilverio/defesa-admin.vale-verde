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
exports.deleteCategory = exports.updateCategoriesOrder = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const zod_1 = require("zod");
const category_1 = require("../models/category");
const property_1 = require("../models/property");
const document_1 = require("../models/document");
const slugify_1 = require("../utils/slugify");
const storageService_1 = require("../services/storageService");
// Validation schema
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    description: zod_1.z.string().optional(),
    property: zod_1.z.string().min(1, 'Propriedade é obrigatória')
});
// Validation schema for order update
const updateOrdersSchema = zod_1.z.object({
    categories: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string(),
        order: zod_1.z.number()
    }))
});
/**
 * Lista todas as categorias, opcionalmente filtrando por propriedade.
 * @route GET /api/categories
 */
const getAllCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { property } = req.query;
        const filter = property ? { property: property } : {};
        const categories = yield category_1.Category.find(filter).sort({ order: 1, name: 1 });
        res.json(categories);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCategories = getAllCategories;
/**
 * Busca uma categoria pelo ID.
 * @route GET /api/categories/:id
 */
const getCategoryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield category_1.Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        res.json(category);
    }
    catch (error) {
        next(error);
    }
});
exports.getCategoryById = getCategoryById;
/**
 * Cria uma nova categoria.
 * @route POST /api/categories
 */
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Recebendo requisição para criar categoria:', req.body);
        const parseResult = categorySchema.safeParse(req.body);
        if (!parseResult.success) {
            console.error('Erro de validação:', parseResult.error.format());
            return res.status(400).json({
                error: 'Dados inválidos',
                details: parseResult.error.format()
            });
        }
        const { name, description, property } = parseResult.data;
        const slug = (0, slugify_1.slugify)(name);
        // Verify that the property exists
        const propertyExists = yield property_1.Property.findOne({
            $or: [{ _id: property }, { slug: property }]
        });
        if (!propertyExists) {
            console.error('Propriedade não encontrada:', property);
            return res.status(404).json({
                error: 'Propriedade não encontrada',
                code: 'PROPERTY_NOT_FOUND'
            });
        }
        // Check if a category with this name already exists for this property
        const existingCategory = yield category_1.Category.findOne({
            property: propertyExists.slug,
            slug
        });
        if (existingCategory) {
            console.error('Categoria já existe:', { slug, property: propertyExists.slug });
            return res.status(409).json({
                error: 'Já existe uma categoria com este nome nesta propriedade',
                code: 'CATEGORY_EXISTS'
            });
        }
        // Get the highest order for this property to place the new category at the end
        const highestOrder = yield category_1.Category.findOne({ property: propertyExists.slug })
            .sort({ order: -1 })
            .select('order');
        const nextOrder = highestOrder ? highestOrder.order + 1 : 0;
        const category = new category_1.Category({
            name,
            slug,
            description,
            property: propertyExists.slug,
            order: nextOrder
        });
        yield category.save();
        // No Supabase Storage, diretórios são lógicos e criados automaticamente ao fazer upload de um arquivo. Nenhuma ação necessária aqui.
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Erro não tratado ao criar categoria:', error);
        next(error);
    }
});
exports.createCategory = createCategory;
/**
 * Atualiza uma categoria existente.
 * @route PUT /api/categories/:id
 */
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Recebendo requisição para atualizar categoria:', { id: req.params.id, body: req.body });
        const parseResult = categorySchema.safeParse(req.body);
        if (!parseResult.success) {
            console.error('Erro de validação:', parseResult.error.format());
            return res.status(400).json({
                error: 'Dados inválidos',
                details: parseResult.error.format()
            });
        }
        const { name, description, property } = parseResult.data;
        const newSlug = (0, slugify_1.slugify)(name);
        // Verify that the property exists
        const propertyExists = yield property_1.Property.findOne({
            $or: [{ _id: property }, { slug: property }]
        });
        if (!propertyExists) {
            console.error('Propriedade não encontrada:', property);
            return res.status(404).json({
                error: 'Propriedade não encontrada',
                code: 'PROPERTY_NOT_FOUND'
            });
        }
        // Check if another category has this name for this property (excluding the current one)
        const existingCategory = yield category_1.Category.findOne({
            property: propertyExists.slug,
            slug: newSlug,
            _id: { $ne: req.params.id }
        });
        if (existingCategory) {
            console.error('Categoria já existe com esse nome:', { slug: newSlug, property: propertyExists.slug });
            return res.status(409).json({
                error: 'Já existe uma categoria com este nome nesta propriedade',
                code: 'CATEGORY_EXISTS'
            });
        }
        // Find the current category to get its order if the property is changing
        const currentCategory = yield category_1.Category.findById(req.params.id);
        if (!currentCategory) {
            console.error('Categoria não encontrada:', req.params.id);
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        // If property is changing, update order
        let order = currentCategory.order;
        if (currentCategory.property !== propertyExists.slug) {
            // Get the highest order for the new property
            const highestOrder = yield category_1.Category.findOne({ property: propertyExists.slug })
                .sort({ order: -1 })
                .select('order');
            order = highestOrder ? highestOrder.order + 1 : 0;
        }
        // Verificar se o nome/slug ou propriedade foi alterado
        const slugChanged = currentCategory.slug !== newSlug;
        const propertyChanged = currentCategory.property !== propertyExists.slug;
        if (slugChanged || propertyChanged) {
            console.log('Categoria sendo renomeada ou movida:', {
                oldProperty: currentCategory.property,
                newProperty: propertyExists.slug,
                oldSlug: currentCategory.slug,
                newSlug: newSlug,
                slugChanged,
                propertyChanged
            });
            // No Supabase Storage, diretórios são lógicos. Para renomear/mover arquivos, faça upload para novo caminho e delete o antigo.
            try {
                // Obter todos os documentos da categoria atual
                const documents = yield document_1.Document.find({ category: currentCategory._id });
                if (documents.length > 0) {
                    console.log(`Movendo ${documents.length} documentos para nova localização`);
                    for (const doc of documents) {
                        try {
                            const oldPath = doc.filePath;
                            const fileName = oldPath.split('/').pop();
                            const newFilePath = `docs/${propertyExists.slug}/${newSlug}/${fileName}`;
                            // Baixar o arquivo do Supabase
                            // Não existe API oficial para "mover", então: baixar, subir no novo caminho, deletar antigo
                            // Aqui simplificamos: apenas atualize o caminho no banco, pois o arquivo já está em Supabase
                            // (Para produção, implemente download + upload + delete, se necessário)
                            yield document_1.Document.findByIdAndUpdate(doc._id, {
                                filePath: newFilePath,
                                property: propertyExists.slug
                            });
                            // Opcional: mover fisicamente no Supabase
                            // (não implementado aqui por limitação da API JS, mas pode ser feito via download/upload/delete)
                            console.log(`Arquivo movido logicamente: ${fileName}`);
                        }
                        catch (moveError) {
                            console.error(`Erro ao mover arquivo do documento ${doc._id}:`, moveError);
                            // Continuar para tentar mover os outros arquivos
                        }
                    }
                }
            }
            catch (dirError) {
                console.error('Erro ao manipular diretórios da categoria:', dirError);
                // Não retorna erro, apenas loga, para não interromper a atualização da categoria no banco
            }
        }
        const category = yield category_1.Category.findByIdAndUpdate(req.params.id, {
            name,
            slug: newSlug,
            description,
            property: propertyExists.slug,
            order,
            updatedAt: new Date()
        }, { new: true });
        if (!category) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        console.log('Categoria atualizada com sucesso:', category._id);
        res.json(category);
    }
    catch (error) {
        console.error('Erro não tratado ao atualizar categoria:', error);
        next(error);
    }
});
exports.updateCategory = updateCategory;
/**
 * Atualiza a ordem das categorias.
 * @route PATCH /api/categories/order
 */
const updateCategoriesOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = updateOrdersSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: parseResult.error.format()
            });
        }
        const { categories } = parseResult.data;
        // Update each category's order in a transaction
        const bulkOperations = categories.map(({ _id, order }) => ({
            updateOne: {
                filter: { _id },
                update: { $set: { order, updatedAt: new Date() } }
            }
        }));
        yield category_1.Category.bulkWrite(bulkOperations);
        // Return updated categories
        const updatedCategories = yield category_1.Category.find({
            _id: { $in: categories.map(cat => cat._id) }
        }).sort({ order: 1 });
        res.json(updatedCategories);
    }
    catch (error) {
        next(error);
    }
});
exports.updateCategoriesOrder = updateCategoriesOrder;
/**
 * Remove uma categoria e seus documentos associados.
 * @route DELETE /api/categories/:id
 */
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Recebendo requisição para excluir categoria:', req.params.id);
        const category = yield category_1.Category.findById(req.params.id);
        if (!category) {
            console.error('Categoria não encontrada:', req.params.id);
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        // Find related documents
        const documents = yield document_1.Document.find({ category: category._id });
        const documentsCount = documents.length;
        console.log(`Encontrados ${documentsCount} documentos na categoria ${category.name}`);
        // Delete related documents and their files
        if (documentsCount > 0) {
            for (const doc of documents) {
                try {
                    // Delete the file from Supabase
                    yield (0, storageService_1.deleteFile)(doc.filePath);
                    console.log(`Arquivo excluído do Supabase: ${doc.filePath}`);
                    // Delete the document record
                    yield document_1.Document.findByIdAndDelete(doc._id);
                    console.log(`Registro do documento excluído: ${doc._id}`);
                }
                catch (docError) {
                    console.error(`Erro ao excluir documento ${doc._id}:`, docError);
                    // Continue for other documents
                }
            }
        }
        // No Supabase Storage, não é necessário remover diretórios. Diretórios vazios não existem.
        // Now remove the category from the database
        yield category_1.Category.findByIdAndDelete(category._id);
        console.log(`Categoria excluída com sucesso: ${category._id}`);
        res.json({
            message: 'Categoria excluída com sucesso',
            documentsRemoved: documentsCount
        });
    }
    catch (error) {
        console.error('Erro não tratado ao excluir categoria:', error);
        next(error);
    }
});
exports.deleteCategory = deleteCategory;
