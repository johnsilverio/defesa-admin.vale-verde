// Arquivo para testar manualmente a autenticação
import { users } from '../src/models/user';

console.log("Início do teste de credenciais");
console.log("Usuários configurados:", JSON.stringify(users, null, 2));

// Função que simula login
function validateCredentials(email: string, password: string) {
  console.log(`Tentando login com: ${email} / ${password}`);
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, message: 'Usuário não encontrado' };
  }
  
  if (user.password !== password) {
    return { success: false, message: 'Senha incorreta' };
  }
  
  return { 
    success: true, 
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  };
}

// Testar o usuário comum
console.log("\n=== TESTE DE USUÁRIO REGULAR ===");
const userTest = validateCredentials('user@example.com', 'user123');
console.log('Resultado:', userTest);

// Testar o administrador Paulo
console.log("\n=== TESTE DE ADMINISTRADOR PAULO ===");
const pauloTest = validateCredentials('paulo.martins@valeverdeambiental.com.br', '@valeverde2025');
console.log('Resultado:', pauloTest);

// Testar o administrador Desenvolvimento
console.log("\n=== TESTE DE ADMINISTRADOR DESENVOLVIMENTO ===");
const devTest = validateCredentials('desenvolvimento@valeverdeambiental.com.br', '@valeverde123');
console.log('Resultado:', devTest);

// Testar credenciais inválidas
console.log("\n=== TESTE DE CREDENCIAIS INVÁLIDAS ===");
const invalidTest = validateCredentials('incorreto@example.com', 'senha_errada');
console.log('Resultado:', invalidTest);

console.log("\nFim do teste de credenciais");