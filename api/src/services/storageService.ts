import fs from 'fs';
import path from 'path';
import { supabase } from './supabaseService';

// Determinação do modo de armazenamento
const isVercelEnvironment = process.env.VERCEL === '1';
const bucket = process.env.SUPABASE_BUCKET;
const localStoragePath = process.env.STORAGE_PATH || './uploads';

// Verifica se o Supabase está configurado e se estamos em ambiente serverless (Vercel)
const useSupabaseStorage = !!supabase && (isVercelEnvironment || !fs.existsSync(localStoragePath));

console.log(`ℹ️ Modo de armazenamento: ${useSupabaseStorage ? 'Supabase' : 'Sistema de arquivos local'}`);

/**
 * Faz upload de um arquivo, seja para o Supabase ou sistema de arquivos local
 */
export async function uploadFile(filePath: string, fileBuffer: Buffer, contentType: string) {
  if (useSupabaseStorage) {
    if (!supabase || !bucket) {
      throw new Error('Supabase não está configurado corretamente para upload de arquivos');
    }
    
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });
    
    if (error) throw error;
    return data;
  } else {
    // Upload para sistema de arquivos local
    const fullPath = path.join(localStoragePath, filePath);
    const directory = path.dirname(fullPath);
    
    // Garante que o diretório existe
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Escreve o arquivo
    fs.writeFileSync(fullPath, fileBuffer);
    return { path: filePath };
  }
}

/**
 * Obtém a URL de um arquivo para download
 */
export async function getFileUrl(filePath: string) {
  if (useSupabaseStorage) {
    if (!supabase || !bucket) {
      throw new Error('Supabase não está configurado corretamente para obter URLs');
    }
    
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60); // 1h
    if (error) throw error;
    return data.signedUrl;
  } else {
    // Para desenvolvimento local, retorna o caminho relativo
    return `/api/uploads/${filePath}`;
  }
}

/**
 * Exclui um arquivo
 */
export async function deleteFile(filePath: string) {
  if (useSupabaseStorage) {
    if (!supabase || !bucket) {
      throw new Error('Supabase não está configurado corretamente para exclusão de arquivos');
    }
    
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
  } else {
    // Exclusão do sistema de arquivos local
    const fullPath = path.join(localStoragePath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Verifica se uma pasta existe
 */
export async function folderExists(folderPath: string) {
  if (useSupabaseStorage) {
    if (!supabase || !bucket) {
      throw new Error('Supabase não está configurado corretamente para verificar pastas');
    }
    
    const { data, error } = await supabase.storage.from(bucket).list(folderPath);
    if (error) throw error;
    return data && data.length > 0;
  } else {
    // Verificação no sistema de arquivos local
    const fullPath = path.join(localStoragePath, folderPath);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  }
}

/**
 * Cria uma pasta
 */
export async function createFolder(folderPath: string) {
  if (useSupabaseStorage) {
    if (!supabase || !bucket) {
      throw new Error('Supabase não está configurado corretamente para criar pastas');
    }
    // Certifique-se de que o caminho termina com /
    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    // Cria um arquivo vazio para simular uma pasta
    const emptyBuffer = Buffer.from('');
    console.log('[DEBUG][createFolder] Bucket:', bucket, 'Path:', `${normalizedPath}.folder`);
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(`${normalizedPath}.folder`, emptyBuffer, {
        contentType: 'application/x-directory',
        upsert: true
      });
      console.log('[DEBUG][createFolder] Resultado upload:', data, error);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG][createFolder] Erro ao criar pasta:', err);
      throw err;
    }
  } else {
    // Criação de pasta no sistema de arquivos local
    const fullPath = path.join(localStoragePath, folderPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return { path: folderPath };
  }
}

/**
 * Lista conteúdo de uma pasta
 */
export async function listFolderContents(folderPath: string) {
  if (useSupabaseStorage) {
    if (!supabase || !bucket) {
      throw new Error('Supabase não está configurado corretamente para listar conteúdo de pastas');
    }
    
    const { data, error } = await supabase.storage.from(bucket).list(folderPath);
    if (error) throw error;
    return data;
  } else {
    // Listagem no sistema de arquivos local
    const fullPath = path.join(localStoragePath, folderPath);
    if (!fs.existsSync(fullPath)) return [];
    
    const files = fs.readdirSync(fullPath);
    return files.map(file => ({
      name: file,
      id: file,
      metadata: {
        size: fs.statSync(path.join(fullPath, file)).size,
        mimetype: path.extname(file) || 'unknown'
      }
    }));
  }
}
