import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { Document, IDocument } from '../models/document';
import { Category } from '../models/category';
import { Property } from '../models/property';
import { FileService } from '../services/fileService';
import { normalizeFileName } from '../utils/slugify';
import { AnyRequestHandler } from '../types/express';

// Initialize file service
const fileService = new FileService();

// Validation schema for document creation/update
const documentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  property: z.string().min(1, 'Propriedade é obrigatória')
});

// Get all documents (with optional filters)
export const getAllDocuments: AnyRequestHandler = async (req, res, next) => {
  try {
    const { category, property, search } = req.query;
    
    let filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (property) {
      filter.property = property;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const documents = await Document.find(filter)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// Get a document by ID
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

// Create a new document
export const createDocument: AnyRequestHandler = async (req: Request & { file?: Express.Multer.File }, res, next) => {
  try {
    // Validate request body
    const parseResult = documentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: parseResult.error.format()
      });
    }
    
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        error: 'Arquivo não fornecido',
        code: 'FILE_REQUIRED'
      });
    }
    
    const { title, description, category, property } = parseResult.data;
    
    // Verify that the property exists
    const propertyExists = await Property.findOne({ 
      $or: [{ _id: property }, { slug: property }] 
    });
    
    if (!propertyExists) {
      return res.status(404).json({ 
        error: 'Propriedade não encontrada',
        code: 'PROPERTY_NOT_FOUND'
      });
    }
    
    // Verify that the category exists
    const categoryExists = await Category.findOne({ 
      $or: [{ _id: category }, { slug: category }],
      property: propertyExists.slug
    });
    
    if (!categoryExists) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        code: 'CATEGORY_NOT_FOUND'
      });
    }
    
    // Save the file
    const { fileName, filePath } = await fileService.saveFile(
      req.file,
      propertyExists.slug,
      categoryExists.slug
    );
    
    // Create the document
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
      uploadedBy: req.user?._id
    });
    
    await document.save();
    
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

// Update a document
export const updateDocument: AnyRequestHandler = async (req: Request & { file?: Express.Multer.File }, res, next) => {
  try {
    // Validate request body
    const parseResult = documentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: parseResult.error.format()
      });
    }
    
    const { title, description, category, property } = parseResult.data;
    
    // Get the existing document
    const existingDocument = await Document.findById(req.params.id);
    if (!existingDocument) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
    // Verify that the property exists
    const propertyExists = await Property.findOne({ 
      $or: [{ _id: property }, { slug: property }] 
    });
    
    if (!propertyExists) {
      return res.status(404).json({ 
        error: 'Propriedade não encontrada',
        code: 'PROPERTY_NOT_FOUND'
      });
    }
    
    // Verify that the category exists
    const categoryExists = await Category.findOne({ 
      $or: [{ _id: category }, { slug: category }],
      property: propertyExists.slug
    });
    
    if (!categoryExists) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        code: 'CATEGORY_NOT_FOUND'
      });
    }
    
    // Update document data
    const updateData: any = {
      title,
      description,
      category: categoryExists._id,
      property: propertyExists.slug,
      updatedAt: new Date()
    };
    
    // If a new file is provided, update file-related fields
    if (req.file) {
      // Delete the old file
      await fileService.deleteFile(existingDocument.filePath);
      
      // Save the new file
      const { fileName, filePath } = await fileService.saveFile(
        req.file,
        propertyExists.slug,
        categoryExists.slug
      );
      
      // Update file-related fields
      updateData.fileName = fileName;
      updateData.originalFileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.fileType = req.file.mimetype;
      updateData.filePath = filePath;
    }
    
    // Update the document
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name slug')
     .populate('uploadedBy', 'name email');
    
    res.json(updatedDocument);
  } catch (error) {
    next(error);
  }
};

// Delete a document
export const deleteDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
    // Delete the file
    await fileService.deleteFile(document.filePath);
    
    // Delete the document record
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};

// Download a document
export const downloadDocument: AnyRequestHandler = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
    const filePath = fileService.getFullPath(document.filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
    res.setHeader('Content-Type', document.fileType);
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
