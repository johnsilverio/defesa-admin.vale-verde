import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Document, IDocument } from '../models/document';
import { Category } from '../models/category';
import { Property } from '../models/property';
import { normalizeFileName, slugify } from '../utils/slugify';
import { AnyRequestHandler } from '../types/express';
import { uploadFile, getFileUrl, deleteFile } from '../services/storageService';
// (Se precisar do upload, importar de '../middlewares/upload')

const documentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  property: z.string().min(1, 'Propriedade é obrigatória'),
  isHighlighted: z.boolean().optional().default(false)
});

/**
 * Lista documentos com filtros opcionais.
 * @route GET /api/documents
 */
export const getAllDocuments: AnyRequestHandler = async (req, res, next) => {
  try {
    const { category, property, search, isHighlighted } = req.query;
    let filter: any = {};
    if (category) filter.category = category;
    if (property) filter.property = property;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isHighlighted !== undefined) filter.isHighlighted = isHighlighted === 'true';
    const documents = await Document.find(filter)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

/**
 * Busca um documento pelo ID.
 * @route GET /api/documents/:id
 */
export const getDocumentById: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'name email');
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    res.json(document);
  } catch (error) {
    next(error);
  }
};

/**
 * Cria um novo documento com upload de arquivo.
 * @route POST /api/documents
 */
export const createDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const { title, description, category: categoryId, property: propertyId, isHighlighted } = req.body;
    const userId = req.user?._id || req.user?.id;
    if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' });

    // Obter informações da categoria e propriedade para construir o caminho correto
    const category = await Category.findById(categoryId);
    const property = await Property.findById(propertyId);
    
    if (!category || !property) {
      return res.status(400).json({ 
        error: 'Categoria ou propriedade inválida',
        details: !category ? 'Categoria não encontrada' : 'Propriedade não encontrada'
      });
    }

    // Construir o caminho correto no formato documentos/nome-da-propriedade/nome-categoria
    const normalizedFileName = normalizeFileName(req.file.originalname);
    const timestamp = Date.now();
    const filePath = `documentos/${property.slug}/${category.slug}/${timestamp}_${normalizedFileName}`;
    
    await uploadFile(filePath, req.file.buffer, req.file.mimetype);

    const document = new Document({
      title,
      description,
      category: categoryId,
      // Armazenar o slug da propriedade em vez do ID para consistência
      property: property.slug,
      isHighlighted: isHighlighted === 'true' || isHighlighted === true,
      fileName: normalizedFileName,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath,
      uploadedBy: userId
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza um documento existente.
 * @route PUT /api/documents/:id
 */
export const updateDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const { title, description, category: categoryId, property: propertyId, isHighlighted } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Documento não encontrado' });

    // Buscar informações da categoria (sempre necessário)
    const category = await Category.findById(categoryId || document.category);
    
    // Buscar informações da propriedade (apenas se houver mudança ou arquivo novo)
    let property;
    if (propertyId) {
      property = await Property.findById(propertyId);
      if (!property) {
        return res.status(400).json({ 
          error: 'Propriedade inválida',
          details: 'Propriedade não encontrada'
        });
      }
    }

    // Se houver novo arquivo
    if (req.file) {
      // Se não encontrou a categoria ou não temos propriedade e nem foi enviada
      if (!category || (!property && !propertyId)) {
        return res.status(400).json({ 
          error: 'Categoria ou propriedade inválida',
          details: !category ? 'Categoria não encontrada' : 'Propriedade necessária para upload'
        });
      }

      // Remove arquivo antigo do Supabase
      if (document.filePath) {
        await deleteFile(document.filePath);
      }
      
      // Se não temos property (objeto) mas temos propertyId, precisamos buscar o property
      if (!property && propertyId) {
        property = await Property.findById(propertyId);
        if (!property) {
          return res.status(400).json({ 
            error: 'Propriedade inválida',
            details: 'Propriedade não encontrada'
          });
        }
      } else if (!property) {
        // Se não temos property nem propertyId, tentamos buscar pela propriedade atual
        // Se document.property for uma string (slug), usamos o slug para buscar
        if (typeof document.property === 'string') {
          property = await Property.findOne({ slug: document.property });
        }
        
        if (!property) {
          return res.status(400).json({ 
            error: 'Propriedade inválida',
            details: 'Não foi possível determinar a propriedade para o novo arquivo'
          });
        }
      }
      
      const normalizedFileName = normalizeFileName(req.file.originalname);
      const timestamp = Date.now();
      const filePath = `documentos/${property.slug}/${category.slug}/${timestamp}_${normalizedFileName}`;
      
      await uploadFile(filePath, req.file.buffer, req.file.mimetype);
      
      document.fileName = normalizedFileName;
      document.originalFileName = req.file.originalname;
      document.fileSize = req.file.size;
      document.fileType = req.file.mimetype;
      document.filePath = filePath;
    } 
    
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (categoryId) document.category = categoryId;
    if (propertyId && property) document.property = property.slug; // Armazenar slug
    
    // Tratar o valor de isHighlighted corretamente
    if (isHighlighted !== undefined) {
      document.isHighlighted = isHighlighted === 'true' || isHighlighted === true;
    }
    
    await document.save();
    
    // Retornar o documento com as relações populadas
    const updatedDocument = await Document.findById(document._id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'name email');
      
    res.json(updatedDocument);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove um documento.
 * @route DELETE /api/documents/:id
 */
export const deleteDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Documento não encontrado' });
    // Remove arquivo do Supabase
    if (document.filePath) {
      await deleteFile(document.filePath);
    }
    await document.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Download de um documento.
 * @route GET /api/documents/:id/download
 */
export const downloadDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Documento não encontrado' });
    // Gera URL temporário do Supabase
    const url = await getFileUrl(document.filePath);
    res.json({ url });
  } catch (error) {
    next(error);
  }
};
