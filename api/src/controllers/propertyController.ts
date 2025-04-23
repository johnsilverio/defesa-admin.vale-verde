import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Property, IProperty } from '../models/property';
import { slugify } from '../utils/slugify';
import { AnyRequestHandler } from '../types/express';

const propertySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  active: z.boolean().optional()
});

/**
 * Lista todas as propriedades.
 * @route GET /api/properties
 */
export const getAllProperties: AnyRequestHandler = async (req, res, next) => {
  try {
    const properties = await Property.find().sort({ name: 1 });
    res.json(properties);
  } catch (error) {
    next(error);
  }
};

/**
 * Busca uma propriedade pelo ID.
 * @route GET /api/properties/:id
 */
export const getPropertyById: AnyRequestHandler = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};

/**
 * Cria uma nova propriedade.
 * @route POST /api/properties
 */
export const createProperty: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = propertySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: parseResult.error.format() });
    }
    const { name, description, active = true } = parseResult.data;
    const slug = slugify(name);
    const existingProperty = await Property.findOne({ slug });
    if (existingProperty) {
      return res.status(409).json({ error: 'Já existe uma propriedade com este nome', code: 'PROPERTY_EXISTS' });
    }
    const property = new Property({ name, slug, description, active });
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza uma propriedade existente.
 * @route PUT /api/properties/:id
 */
export const updateProperty: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = propertySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: parseResult.error.format() });
    }
    const { name, description, active } = parseResult.data;
    const slug = slugify(name);
    const existingProperty = await Property.findOne({ slug, _id: { $ne: req.params.id } });
    if (existingProperty) {
      return res.status(409).json({ error: 'Já existe uma propriedade com este nome', code: 'PROPERTY_EXISTS' });
    }
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, active, updatedAt: new Date() },
      { new: true }
    );
    if (!property) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove uma propriedade.
 * @route DELETE /api/properties/:id
 */
export const deleteProperty: AnyRequestHandler = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }
    // Aqui poderia ser implementada a exclusão em cascata de categorias e documentos relacionados
    res.json({ message: 'Propriedade excluída com sucesso' });
  } catch (error) {
    next(error);
  }
};