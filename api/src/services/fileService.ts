import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { normalizeFileName, slugify } from '../utils/slugify';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

/**
 * Service to handle file operations
 */
export class FileService {
  private storagePath: string;
  
  constructor() {
    this.storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
    this.ensureStoragePathExists();
  }
  
  /**
   * Ensures the storage directory exists
   */
  private async ensureStoragePathExists(): Promise<void> {
    try {
      if (!(await exists(this.storagePath))) {
        console.log(`Criando diretório de armazenamento principal: ${this.storagePath}`);
        await mkdir(this.storagePath, { recursive: true });
      } else {
        console.log(`Diretório de armazenamento já existe: ${this.storagePath}`);
      }
    } catch (error: unknown) {
      console.error('Erro ao criar diretório de armazenamento:', error);
      throw new Error('Failed to create storage directory');
    }
  }
  
  /**
   * Ensures property and category directories exist
   * This is now public so it can be called directly when needed
   */
  public async ensureDirectoryExists(propertySlug: string, categorySlug: string): Promise<void> {
    const propertyPath = path.join(this.storagePath, propertySlug);
    const categoryPath = path.join(propertyPath, categorySlug);
    
    try {
      console.log(`Verificando diretório da propriedade: ${propertyPath}`);
      if (!(await exists(propertyPath))) {
        console.log(`Criando diretório da propriedade: ${propertyPath}`);
        await mkdir(propertyPath, { recursive: true });
      }
      
      console.log(`Verificando diretório da categoria: ${categoryPath}`);
      if (!(await exists(categoryPath))) {
        console.log(`Criando diretório da categoria: ${categoryPath}`);
        await mkdir(categoryPath, { recursive: true });
      }
    } catch (error: unknown) {
      console.error('Erro ao criar diretórios:', error);
      console.error(`Verifique se o serviço tem permissões para criar em: ${this.storagePath}`);
      throw new Error(`Falha ao criar diretórios. Verifique as permissões em ${this.storagePath}`);
    }
  }
  
  /**
   * Moves a file from one location to another within the storage
   */
  public async moveFile(oldRelativePath: string, newRelativePath: string): Promise<void> {
    const oldFullPath = path.join(this.storagePath, oldRelativePath);
    const newFullPath = path.join(this.storagePath, newRelativePath);
    
    console.log(`Movendo arquivo de ${oldFullPath} para ${newFullPath}`);
    
    try {
      // Check if source file exists
      if (!(await exists(oldFullPath))) {
        throw new Error(`Arquivo de origem não encontrado: ${oldFullPath}`);
      }
      
      // Ensure destination directory exists
      const newDir = path.dirname(newFullPath);
      if (!(await exists(newDir))) {
        await mkdir(newDir, { recursive: true });
      }
      
      // Read the source file and write to destination
      const fileData = await fs.promises.readFile(oldFullPath);
      await fs.promises.writeFile(newFullPath, fileData);
      
      // After successful copy, delete the original
      await unlink(oldFullPath);
      
      console.log(`Arquivo movido com sucesso para ${newRelativePath}`);
    } catch (error: unknown) {
      console.error('Erro ao mover arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao mover arquivo: ${errorMessage}`);
    }
  }
  
  /**
   * Saves a file to the appropriate directory structure
   */
  public async saveFile(
    file: Express.Multer.File,
    propertySlug: string,
    categorySlug: string,
    customFileName?: string
  ): Promise<{ fileName: string, filePath: string }> {
    try {
      // Garantir que os slugs sejam sanitizados
      propertySlug = propertySlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      categorySlug = categorySlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      console.log(`Preparando para salvar arquivo na estrutura: ${propertySlug}/${categorySlug}`);
      await this.ensureDirectoryExists(propertySlug, categorySlug);
      
      const normalizedFileName = customFileName ? 
        normalizeFileName(customFileName) : 
        normalizeFileName(file.originalname);
      
      const filePath = path.join(
        this.storagePath,
        propertySlug,
        categorySlug,
        normalizedFileName
      );
      
      console.log(`Salvando arquivo em: ${filePath}`);
      await writeFile(filePath, file.buffer);
      
      console.log(`Arquivo salvo com sucesso: ${normalizedFileName}`);
      return {
        fileName: normalizedFileName,
        filePath: path.join(propertySlug, categorySlug, normalizedFileName)
      };
    } catch (error: unknown) {
      console.error('Erro detalhado ao salvar arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao salvar arquivo: ${errorMessage}`);
    }
  }
  
  /**
   * Deletes a file from storage
   */
  public async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.storagePath, filePath);
    
    try {
      if (await exists(fullPath)) {
        await unlink(fullPath);
        console.log(`Arquivo excluído: ${fullPath}`);
      } else {
        console.log(`Arquivo não encontrado para exclusão: ${fullPath}`);
      }
    } catch (error: unknown) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
  
  /**
   * Gets the full path to a file
   */
  public getFullPath(filePath: string): string {
    return path.join(this.storagePath, filePath);
  }
  
  /**
   * Gets the storage base path
   */
  public getStoragePath(): string {
    return this.storagePath;
  }
}