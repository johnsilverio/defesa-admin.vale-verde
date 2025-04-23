"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../models/user");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const initAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB (only in development)
        if (process.env.NODE_ENV !== 'development') {
            console.log('This script is only for development environment');
            process.exit(0);
        }
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defesa-admin';
        yield mongoose_1.default.connect(mongoURI);
        console.log('MongoDB conectado com sucesso');
        // Check if admin user already exists
        const adminExists = yield user_1.User.findOne({ email: 'desenvolvimento@valeverdeambiental.com.br' });
        if (adminExists) {
            console.log('Usuário admin encontrado, excluindo para recriar...');
            yield user_1.User.deleteOne({ email: 'desenvolvimento@valeverdeambiental.com.br' });
            console.log('Usuário admin excluído com sucesso');
        }
        // Create the default admin user without linking to any specific property
        // Admins should have access to all properties through the admin panel
        const admin = new user_1.User({
            name: 'Desenvolvimento',
            email: 'desenvolvimento@valeverdeambiental.com.br',
            password: '@valeverde123',
            role: 'admin',
            properties: [] // Admin doesn't need specific properties, will manage all through the admin panel
        });
        yield admin.save();
        console.log('Usuário admin criado com sucesso');
        yield mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Erro ao inicializar o admin:', error);
        yield mongoose_1.default.disconnect();
        process.exit(1);
    }
});
// Run the function
initAdmin();
