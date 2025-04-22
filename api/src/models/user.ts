import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface que define a estrutura do documento de usuário
 * @extends Document do Mongoose
 */
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  properties: string[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  properties: {
    type: [String],
    default: ['fazenda-brilhante'] // Por padrão, todos os usuários têm acesso à Fazenda Brilhante
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Middleware executado antes de salvar o usuário
 * Realiza o hash da senha se ela foi modificada
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Método para comparar a senha fornecida com a senha armazenada
 * @param candidatePassword - Senha a ser verificada
 * @returns Promise<boolean> - True se a senha estiver correta
 */
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
