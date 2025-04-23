import mongoose, { Document } from 'mongoose';

/**
 * Interface de propriedade do sistema.
 */
export interface IProperty extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Property = mongoose.model<IProperty>('Property', propertySchema);