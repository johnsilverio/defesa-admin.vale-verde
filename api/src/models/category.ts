import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  property: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  property: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 9999 // Default to a high number so new categories appear at the end
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for property + slug to ensure uniqueness
categorySchema.index({ property: 1, slug: 1 }, { unique: true });

// Update the updatedAt field on save
categorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Category = mongoose.model<ICategory>('Category', categorySchema); 