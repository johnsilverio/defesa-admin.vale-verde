import { users } from '../src/models/user';

describe('Auth Unit Tests', () => {
  test('user credentials should match configured values', () => {
    // Verificar se o usuário regular existe
    const user = users.find(u => u.email === 'user@example.com');
    expect(user).toBeDefined();
    expect(user?.password).toBe('user123');
    expect(user?.role).toBe('user');
    
    // Verificar se o administrador Paulo existe
    const adminPaulo = users.find(u => u.email === 'paulo.martins@valeverdeambiental.com.br');
    expect(adminPaulo).toBeDefined();
    expect(adminPaulo?.password).toBe('@valeverde2025');
    expect(adminPaulo?.role).toBe('admin');
    
    // Verificar se o administrador Desenvolvimento existe
    const adminDev = users.find(u => u.email === 'desenvolvimento@valeverdeambiental.com.br');
    expect(adminDev).toBeDefined();
    expect(adminDev?.password).toBe('@valeverde123');
    expect(adminDev?.role).toBe('admin');
  });
});