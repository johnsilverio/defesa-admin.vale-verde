import mongoose, { Document as MongoDocument } from 'mongoose';

/**
 * Interface que define a estrutura do documento
 * @extends MongoDocument do Mongoose
 */
export interface IDocument extends MongoDocument {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  category: string;
  property: string;
  uploadedBy: string;
  isHighlighted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema do Mongoose para documentos
 * Define a estrutura dos documentos armazenados no banco de dados
 */
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  property: {
    type: String,
    required: true,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isHighlighted: {
    type: Boolean,
    default: false
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

/**
 * Middleware executado antes de salvar o documento
 * Atualiza o campo updatedAt com a data atual
 */
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Modelo de Documento
 * Usado para realizar operações CRUD na coleção de documentos
 */
export const Document = mongoose.model<IDocument>('Document', documentSchema);
