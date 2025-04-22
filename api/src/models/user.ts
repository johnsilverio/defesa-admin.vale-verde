export interface User {
  id: number;
  email: string;
  password: string; // hash
  name?: string;
  role: 'user' | 'admin';
  properties?: string[]; // IDs ou nomes das propriedades associadas ao usuário
}

export const users: User[] = [
  // Usuário admin - Paulo Martins
  { 
    id: 1, 
    email: 'paulo.martins@valeverdeambiental.com.br', 
    password: '@valeverde2025',
    name: 'Paulo Martins',
    role: 'admin',
    properties: ['todas'] // Admin tem acesso a todas as propriedades
  },
  // Usuário admin - Desenvolvimento
  { 
    id: 2, 
    email: 'desenvolvimento@valeverdeambiental.com.br', 
    password: '@valeverde123',
    name: 'Desenvolvimento Vale Verde',
    role: 'admin',
    properties: ['todas'] // Admin tem acesso a todas as propriedades
  },
  // Usuário comum para teste
  {
    id: 3,
    email: 'user@example.com',
    password: 'user123', // Em produção, usar hash bcrypt
    name: 'John',
    role: 'user',
    properties: ['fazenda-brilhante'] // Usuário tem acesso apenas à Fazenda Brilhante
  }
];
