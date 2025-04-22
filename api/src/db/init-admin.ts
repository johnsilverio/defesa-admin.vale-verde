import mongoose from 'mongoose';
import { User } from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

const initAdmin = async () => {
  try {
    // Connect to MongoDB (only in development)
    if (process.env.NODE_ENV !== 'development') {
      console.log('This script is only for development environment');
      process.exit(0);
    }

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defesa-admin';
    await mongoose.connect(mongoURI);
    console.log('MongoDB conectado com sucesso');

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'desenvolvimento@valeverdeambiental.com.br' });
    if (adminExists) {
      console.log('Usuário admin encontrado, excluindo para recriar...');
      await User.deleteOne({ email: 'desenvolvimento@valeverdeambiental.com.br' });
      console.log('Usuário admin excluído com sucesso');
    }

    // Create the default admin user without linking to any specific property
    // Admins should have access to all properties through the admin panel
    const admin = new User({
      name: 'Desenvolvimento',
      email: 'desenvolvimento@valeverdeambiental.com.br',
      password: '@valeverde123',
      role: 'admin',
      properties: [] // Admin doesn't need specific properties, will manage all through the admin panel
    });

    await admin.save();
    console.log('Usuário admin criado com sucesso');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar o admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the function
initAdmin(); 