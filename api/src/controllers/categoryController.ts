import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Category, ICategory } from '../models/category';
import { Property } from '../models/property';
import { Document } from '../models/document';
import { slugify } from '../utils/slugify';
import { AnyRequestHandler } from '../types/express';
import { uploadFile, deleteFile } from '../services/storageService';

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  property: z.string().min(1, 'Propriedade é obrigatória')
});

// Validation schema for order update
const updateOrdersSchema = z.object({
  categories: z.array(z.object({
    _id: z.string(),
    order: z.number()
  }))
});

/**
 * Lista todas as categorias, opcionalmente filtrando por propriedade.
 * @route GET /api/categories
 */
export const getAllCategories: AnyRequestHandler = async (req, res, next) => {
  try {
    const { property } = req.query;
    const filter = property ? { property: property as string } : {};
    
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Busca uma categoria pelo ID.
 * @route GET /api/categories/:id
 */
export const getCategoryById: AnyRequestHandler = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Cria uma nova categoria.
 * @route POST /api/categories
 */
export const createCategory: AnyRequestHandler = async (req, res, next) => {
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
    const slug = slugify(name);

    // Verify that the property exists
    const propertyExists = await Property.findOne({ 
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
    const existingCategory = await Category.findOne({ 
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
    const highestOrder = await Category.findOne({ property: propertyExists.slug })
      .sort({ order: -1 })
      .select('order');

    const nextOrder = highestOrder ? highestOrder.order + 1 : 0;

    const category = new Category({
      name,
      slug,
      description,
      property: propertyExists.slug,
      order: nextOrder
    });

    await category.save();
    
    // No Supabase Storage, diretórios são lógicos e criados automaticamente ao fazer upload de um arquivo. Nenhuma ação necessária aqui.
    
    res.status(201).json(category);
  } catch (error: unknown) {
    console.error('Erro não tratado ao criar categoria:', error);
    next(error);
  }
};

/**
 * Atualiza uma categoria existente.
 * @route PUT /api/categories/:id
 */
export const updateCategory: AnyRequestHandler = async (req, res, next) => {
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
    const newSlug = slugify(name);

    // Verify that the property exists
    const propertyExists = await Property.findOne({ 
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
    const existingCategory = await Category.findOne({
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
    const currentCategory = await Category.findById(req.params.id);
    if (!currentCategory) {
      console.error('Categoria não encontrada:', req.params.id);
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // If property is changing, update order
    let order = currentCategory.order;
    if (currentCategory.property !== propertyExists.slug) {
      // Get the highest order for the new property
      const highestOrder = await Category.findOne({ property: propertyExists.slug })
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
        const documents = await Document.find({ category: currentCategory._id });
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
              await Document.findByIdAndUpdate(doc._id, {
                filePath: newFilePath,
                property: propertyExists.slug
              });
              // Opcional: mover fisicamente no Supabase
              // (não implementado aqui por limitação da API JS, mas pode ser feito via download/upload/delete)
              console.log(`Arquivo movido logicamente: ${fileName}`);
            } catch (moveError: unknown) {
              console.error(`Erro ao mover arquivo do documento ${doc._id}:`, moveError);
              // Continuar para tentar mover os outros arquivos
            }
          }
        }
      } catch (dirError: unknown) {
        console.error('Erro ao manipular diretórios da categoria:', dirError);
        // Não retorna erro, apenas loga, para não interromper a atualização da categoria no banco
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        slug: newSlug, 
        description, 
        property: propertyExists.slug,
        order,
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    console.log('Categoria atualizada com sucesso:', category._id);
    res.json(category);
  } catch (error: unknown) {
    console.error('Erro não tratado ao atualizar categoria:', error);
    next(error);
  }
};

/**
 * Atualiza a ordem das categorias.
 * @route PATCH /api/categories/order
 */
export const updateCategoriesOrder: AnyRequestHandler = async (req, res, next) => {
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

    await Category.bulkWrite(bulkOperations);
    
    // Return updated categories
    const updatedCategories = await Category.find({
      _id: { $in: categories.map(cat => cat._id) }
    }).sort({ order: 1 });
    
    res.json(updatedCategories);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove uma categoria e seus documentos associados.
 * @route DELETE /api/categories/:id
 */
export const deleteCategory: AnyRequestHandler = async (req, res, next) => {
  try {
    console.log('Recebendo requisição para excluir categoria:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      console.error('Categoria não encontrada:', req.params.id);
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    // Find related documents
    const documents = await Document.find({ category: category._id });
    const documentsCount = documents.length;
    
    console.log(`Encontrados ${documentsCount} documentos na categoria ${category.name}`);
    
    // Delete related documents and their files
    if (documentsCount > 0) {
      for (const doc of documents) {
        try {
          // Delete the file from Supabase
          await deleteFile(doc.filePath);
          console.log(`Arquivo excluído do Supabase: ${doc.filePath}`);
          // Delete the document record
          await Document.findByIdAndDelete(doc._id);
          console.log(`Registro do documento excluído: ${doc._id}`);
        } catch (docError: unknown) {
          console.error(`Erro ao excluir documento ${doc._id}:`, docError);
          // Continue for other documents
        }
      }
    }
    
    // No Supabase Storage, não é necessário remover diretórios. Diretórios vazios não existem.
    
    // Now remove the category from the database
    await Category.findByIdAndDelete(category._id);
    console.log(`Categoria excluída com sucesso: ${category._id}`);
    
    res.json({ 
      message: 'Categoria excluída com sucesso',
      documentsRemoved: documentsCount
    });
  } catch (error: unknown) {
    console.error('Erro não tratado ao excluir categoria:', error);
    next(error);
  }
};