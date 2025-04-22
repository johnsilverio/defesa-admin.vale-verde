export interface User {
  id: number;
  email: string;
  password: string; // hash
  name?: string;
  role: 'user' | 'admin';
  properties?: string[]; // IDs ou nomes das propriedades associadas ao usuário
}

export const users: User[] = [
  // Usuário admin de teste (senha em texto puro para facilitar testes em desenvolvimento)
  { 
    id: 1, 
    email: 'admin@example.com', 
    password: 'password123', // Em produção, usar hash bcrypt
    name: 'Administrador',
    role: 'admin',
    properties: ['todas'] // Admin tem acesso a todas as propriedades
  },
  // Usuário comum de teste (senha em texto puro para facilitar testes em desenvolvimento)
  {
    id: 2,
    email: 'user@example.com',
    password: 'password123', // Em produção, usar hash bcrypt
    name: 'John Doe',
    role: 'user',
    properties: ['fazenda-brilhante'] // Usuário tem acesso apenas à Fazenda Brilhante
  },
  // Outro usuário de teste para demonstrar isolamento entre propriedades
  {
    id: 3,
    email: 'maria@example.com',
    password: 'password123', // Em produção, usar hash bcrypt
    name: 'Maria Silva',
    role: 'user',
    properties: ['fazenda-aurora'] // Este usuário tem acesso apenas à Fazenda Aurora
  }
];
