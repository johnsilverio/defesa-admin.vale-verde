import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Document, IDocument } from '../models/document';
import { Category } from '../models/category';
import { Property } from '../models/property';
import { normalizeFileName } from '../utils/slugify';
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
    const { title, description, category, property, isHighlighted } = req.body;
    const userId = req.user?._id || req.user?.id;
    if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' });

    const normalizedFileName = normalizeFileName(req.file.originalname);
    const filePath = `docs/${Date.now()}_${normalizedFileName}`;
    await uploadFile(filePath, req.file.buffer, req.file.mimetype);

    const document = new Document({
      title,
      description,
      category,
      property,
      isHighlighted: !!isHighlighted,
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
    const { title, description, category, property, isHighlighted } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Documento não encontrado' });

    // Se houver novo arquivo, faz upload no Supabase e remove o antigo
    if (req.file) {
      // Remove arquivo antigo do Supabase
      if (document.filePath) {
        await deleteFile(document.filePath);
      }
      const normalizedFileName = normalizeFileName(req.file.originalname);
      const filePath = `docs/${Date.now()}_${normalizedFileName}`;
      await uploadFile(filePath, req.file.buffer, req.file.mimetype);
      document.fileName = normalizedFileName;
      document.originalFileName = req.file.originalname;
      document.fileSize = req.file.size;
      document.fileType = req.file.mimetype;
      document.filePath = filePath;
    }
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    if (property) document.property = property;
    if (isHighlighted !== undefined) document.isHighlighted = isHighlighted;
    await document.save();
    res.json(document);
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
