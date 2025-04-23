import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Document, IDocument } from '../models/document';
import { Category } from '../models/category';
import { Property } from '../models/property';
import { FileService } from '../services/fileService';
import { normalizeFileName } from '../utils/slugify';
import { AnyRequestHandler } from '../types/express';

const fileService = new FileService();

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
export const createDocument: AnyRequestHandler = async (req: Request & { file?: Express.Multer.File }, res, next) => {
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
    const propertyExists = await Property.findOne({ $or: [{ _id: property }, { slug: property }] });
    if (!propertyExists) {
      return res.status(404).json({ error: 'Propriedade não encontrada', code: 'PROPERTY_NOT_FOUND' });
    }
    const categoryExists = await Category.findOne({ $or: [{ _id: category }, { slug: category }], property: propertyExists.slug });
    if (!categoryExists) {
      return res.status(404).json({ error: 'Categoria não encontrada', code: 'CATEGORY_NOT_FOUND' });
    }
    try {
      const { fileName, filePath } = await fileService.saveFile(
        req.file,
        propertyExists.slug,
        categoryExists.slug
      );
      const document = new Document({
        title,
        description,
        fileName,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        filePath,
        category: categoryExists._id,
        property: propertyExists.slug,
        uploadedBy: req.user?._id,
        isHighlighted: isHighlighted || false
      });
      await document.save();
      res.status(201).json(document);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({ error: 'Falha ao salvar o arquivo', details: errorMessage });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza um documento existente.
 * @route PUT /api/documents/:id
 */
export const updateDocument: AnyRequestHandler = async (req: Request & { file?: Express.Multer.File }, res, next) => {
  try {
    if (typeof req.body.isHighlighted === 'string') {
      req.body.isHighlighted = req.body.isHighlighted === 'true';
    }
    const parseResult = documentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid data', details: parseResult.error.format() });
    }
    const { title, description, category, property, isHighlighted } = parseResult.data;
    const existingDocument = await Document.findById(req.params.id);
    if (!existingDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const propertyExists = await Property.findOne({ $or: [{ _id: property }, { slug: property }] });
    if (!propertyExists) {
      return res.status(404).json({ error: 'Property not found', code: 'PROPERTY_NOT_FOUND' });
    }
    const categoryExists = await Category.findOne({ $or: [{ _id: category }, { slug: category }], property: propertyExists.slug });
    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found', code: 'CATEGORY_NOT_FOUND' });
    }
    const updateData: any = {
      title,
      description,
      category: categoryExists._id,
      property: propertyExists.slug,
      isHighlighted: isHighlighted || false,
      updatedAt: new Date()
    };
    if (req.file) {
      try {
        await fileService.ensureDirectoryExists(propertyExists.slug, categoryExists.slug);
        await fileService.deleteFile(existingDocument.filePath);
        const { fileName, filePath } = await fileService.saveFile(
          req.file,
          propertyExists.slug,
          categoryExists.slug
        );
        updateData.fileName = fileName;
        updateData.originalFileName = req.file.originalname;
        updateData.fileSize = req.file.size;
        updateData.fileType = req.file.mimetype;
        updateData.filePath = filePath;
      } catch (fileError: unknown) {
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to process file', details: errorMessage });
      }
    } else if (existingDocument.category.toString() !== categoryExists._id.toString()) {
      try {
        await fileService.ensureDirectoryExists(propertyExists.slug, categoryExists.slug);
        const oldFilePath = existingDocument.filePath;
        const fileName = path.basename(oldFilePath);
        const newFilePath = path.join(propertyExists.slug, categoryExists.slug, fileName);
        await fileService.moveFile(oldFilePath, newFilePath);
        updateData.filePath = newFilePath;
      } catch (moveError: unknown) {
        const errorMessage = moveError instanceof Error ? moveError.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to move file to new category', details: errorMessage });
      }
    }
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name slug')
     .populate('uploadedBy', 'name email');
    res.json(updatedDocument);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to update document', details: errorMessage });
  }
};

/**
 * Remove um documento.
 * @route DELETE /api/documents/:id
 */
export const deleteDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    await fileService.deleteFile(document.filePath);
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to delete document', details: errorMessage });
  }
};

/**
 * Download de um documento.
 * @route GET /api/documents/:id/download
 */
export const downloadDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const filePath = fileService.getFullPath(document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
    res.setHeader('Content-Type', document.fileType);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
