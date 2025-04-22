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
import e from 'express'

// Initialize file service
const fileService = new FileService();

// Validation schema for document creation/update
const documentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  property: z.string().min(1, 'Propriedade é obrigatória'),
  isHighlighted: z.boolean().optional().default(false)
});

// Get all documents (with optional filters)
export const getAllDocuments: AnyRequestHandler = async (req, res, next) => {
  try {
    const { category, property, search, isHighlighted } = req.query;
    
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
    
    // Filtrar por documentos destacados/cruciais
    if (isHighlighted !== undefined) {
      filter.isHighlighted = isHighlighted === 'true';
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
    console.log('Recebendo requisição para criar documento:', { 
      body: req.body,
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });
    
    // Verifica se está recebendo o arquivo corretamente
    if (!req.file) {
      console.error('Erro: Nenhum arquivo recebido. Verifique se o campo file está sendo enviado corretamente');
      return res.status(400).json({
        error: 'Arquivo não fornecido',
        code: 'FILE_REQUIRED'
      });
    }
    
    // Log do arquivo recebido
    console.log('Arquivo recebido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Converter isHighlighted para boolean se vier como string
    if (typeof req.body.isHighlighted === 'string') {
      req.body.isHighlighted = req.body.isHighlighted === 'true';
    }
    
    // Validate request body
    const parseResult = documentSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error('Erro de validação:', parseResult.error.format());
      return res.status(400).json({
        error: 'Dados inválidos',
        details: parseResult.error.format()
      });
    }
    
    const { title, description, category, property, isHighlighted } = parseResult.data;
    
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
    
    // Verify that the category exists
    const categoryExists = await Category.findOne({ 
      $or: [{ _id: category }, { slug: category }],
      property: propertyExists.slug
    });
    
    if (!categoryExists) {
      console.error('Categoria não encontrada:', { category, property: propertyExists.slug });
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        code: 'CATEGORY_NOT_FOUND'
      });
    }
    
    console.log('Salvando arquivo para propriedade e categoria:', {
      property: propertyExists.slug,
      category: categoryExists.slug
    });
    
    // Save the file
    try {
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
        uploadedBy: req.user?._id,
        isHighlighted: isHighlighted || false
      });
      
      await document.save();
      console.log('Documento salvo com sucesso:', document._id);
      
      res.status(201).json(document);
    } catch (error: unknown) {
      console.error('Erro ao salvar arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({
        error: 'Falha ao salvar o arquivo',
        details: errorMessage
      });
    }
  } catch (error) {
    console.error('Erro não tratado ao criar documento:', error);
    next(error);
  }
};

// Update a document
export const updateDocument: AnyRequestHandler = async (req: Request & { file?: Express.Multer.File }, res, next) => {
  try {
    console.log('Recebendo requisição para atualizar documento:', { 
      id: req.params.id,
      body: req.body,
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });
    
    // Converter isHighlighted para boolean se vier como string
    if (typeof req.body.isHighlighted === 'string') {
      req.body.isHighlighted = req.body.isHighlighted === 'true';
    }
    
    // Validate request body
    const parseResult = documentSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error('Erro de validação na atualização:', parseResult.error.format());
      return res.status(400).json({
        error: 'Dados inválidos',
        details: parseResult.error.format()
      });
    }
    
    const { title, description, category, property, isHighlighted } = parseResult.data;
    
    // Get the existing document
    const existingDocument = await Document.findById(req.params.id);
    if (!existingDocument) {
      console.error('Documento não encontrado:', req.params.id);
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
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
    
    console.log('Verificando categoria:', { 
      category, 
      property: propertyExists.slug,
      isObjectId: mongoose.Types.ObjectId.isValid(category)
    });
    
    // Verify that the category exists
    const categoryExists = await Category.findOne({ 
      $or: [{ _id: category }, { slug: category }],
      property: propertyExists.slug
    });
    
    if (!categoryExists) {
      console.error('Categoria não encontrada:', { category, property: propertyExists.slug });
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        code: 'CATEGORY_NOT_FOUND'
      });
    }
    
    console.log('Categoria encontrada:', { 
      id: categoryExists._id, 
      slug: categoryExists.slug 
    });
    
    // Update document data
    const updateData: any = {
      title,
      description,
      category: categoryExists._id,
      property: propertyExists.slug,
      isHighlighted: isHighlighted || false,
      updatedAt: new Date()
    };
    
    // If a new file is provided, update file-related fields
    if (req.file) {
      console.log('Processando novo arquivo para documento:', {
        originalname: req.file.originalname,
        size: req.file.size
      });
      
      try {
        // Ensure directory exists before trying to save or delete files
        await fileService.ensureDirectoryExists(propertyExists.slug, categoryExists.slug);
        
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
      } catch (fileError: unknown) {
        console.error('Erro ao processar arquivo:', fileError);
        const errorMessage = fileError instanceof Error ? fileError.message : 'Erro desconhecido';
        return res.status(500).json({
          error: 'Falha ao processar o arquivo',
          details: errorMessage
        });
      }
    } else if (existingDocument.category.toString() !== categoryExists._id.toString()) {
      // If category changed but no new file provided, move the existing file to the new category folder
      console.log('Categoria alterada sem novo arquivo. Movendo arquivo existente para nova categoria.');
      try {
        // Ensure the new directory exists
        await fileService.ensureDirectoryExists(propertyExists.slug, categoryExists.slug);
        
        // Move the file to the new location
        const oldFilePath = existingDocument.filePath;
        const fileName = path.basename(oldFilePath);
        const newFilePath = path.join(propertyExists.slug, categoryExists.slug, fileName);
        
        await fileService.moveFile(oldFilePath, newFilePath);
        
        // Update file path in database
        updateData.filePath = newFilePath;
      } catch (moveError: unknown) {
        console.error('Erro ao mover arquivo para nova categoria:', moveError);
        const errorMessage = moveError instanceof Error ? moveError.message : 'Erro desconhecido';
        return res.status(500).json({
          error: 'Falha ao mover o arquivo para nova categoria',
          details: errorMessage
        });
      }
    }
    
    // Update the document
    console.log('Atualizando documento com dados:', updateData);
    
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name slug')
     .populate('uploadedBy', 'name email');
    
    console.log('Documento atualizado com sucesso:', updatedDocument?._id);
    res.json(updatedDocument);
  } catch (error: unknown) {
    console.error('Erro não tratado ao atualizar documento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return res.status(500).json({
      error: 'Falha ao atualizar documento',
      details: errorMessage
    });
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
