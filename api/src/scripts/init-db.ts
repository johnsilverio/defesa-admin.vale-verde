import mongoose from 'mongoose';
import { User } from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

const initDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defesa-admin';
    await mongoose.connect(mongoURI);
    console.log('MongoDB conectado com sucesso');

    // Verifica se já existe um usuário admin
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      // Cria o usuário admin padrão
      const admin = new User({
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'password123', // A senha será hashed automaticamente pelo middleware
        role: 'admin',
        properties: ['todas'] // Admin tem acesso a todas as propriedades
      });

      await admin.save();
      console.log('Usuário admin criado com sucesso');
    } else {
      console.log('Usuário admin já existe');
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  }
};

initDB(); 