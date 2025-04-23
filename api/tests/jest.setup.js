// Definir variáveis de ambiente antes de tudo
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'mock-service-key';
process.env.SUPABASE_BUCKET = 'mock-bucket';
process.env.VERCEL = '1'; // Simula ambiente serverless

// Mock do supabaseService ANTES que seja importado por qualquer outro módulo
jest.mock('../src/services/supabaseService', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'mocked-path' }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://mock-supabase.com/signed-url' }, error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        list: jest.fn().mockResolvedValue({ data: [{ name: 'arquivo-mock.pdf' }], error: null })
      })
    }
  }
}), { virtual: true });

// Mock das funções do serviço de armazenamento para usar o novo padrão de caminho
jest.mock('../src/services/storageService', () => ({
  uploadFile: jest.fn().mockImplementation(async (path) => {
    // Se o caminho não começar com 'documentos/', reescreva para o novo padrão
    const propertySlug = 'fazenda-mock';
    const categorySlug = 'categoria-mock';
    const fileName = path.split('/').pop();
    const newPath = path.startsWith('documentos/') 
      ? path 
      : `documentos/${propertySlug}/${categorySlug}/${Date.now()}_${fileName}`;
    console.log(`Mock uploadFile: ${path} -> ${newPath}`);
    return { path: newPath };
  }),
  getFileUrl: jest.fn().mockImplementation(async () => 'https://mock-supabase.com/signed-url'),
  deleteFile: jest.fn().mockImplementation(async () => {}),
  createFolder: jest.fn().mockImplementation(async (path) => ({ path: `${path}/.folder` })),
  folderExists: jest.fn().mockImplementation(async () => true),
  listFolderContents: jest.fn().mockImplementation(async () => [{ name: 'arquivo-mock.pdf', id: 'mock-id' }])
}));