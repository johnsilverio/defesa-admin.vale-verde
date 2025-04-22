import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Category, ICategory } from '../models/category';
import { Property } from '../models/property';
import { slugify } from '../utils/slugify';
import { AnyRequestHandler } from '../types/express';

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

// Get all categories (optionally filtered by property)
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

// Get a category by ID
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

// Create a new category
export const createCategory: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
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
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// Update a category
export const updateCategory: AnyRequestHandler = async (req, res, next) => {
  try {
    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
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
      return res.status(404).json({ 
        error: 'Propriedade não encontrada',
        code: 'PROPERTY_NOT_FOUND'
      });
    }

    // Check if another category has this name for this property (excluding the current one)
    const existingCategory = await Category.findOne({
      property: propertyExists.slug,
      slug,
      _id: { $ne: req.params.id }
    });
    
    if (existingCategory) {
      return res.status(409).json({
        error: 'Já existe uma categoria com este nome nesta propriedade',
        code: 'CATEGORY_EXISTS'
      });
    }

    // Find the current category to get its order if the property is changing
    const currentCategory = await Category.findById(req.params.id);
    if (!currentCategory) {
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

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        slug, 
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

    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Update categories orders
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

// Delete a category
export const deleteCategory: AnyRequestHandler = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    // Here you would also delete all documents related to this category
    // This would be implemented with additional logic or a service
    
    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    next(error);
  }
}; 