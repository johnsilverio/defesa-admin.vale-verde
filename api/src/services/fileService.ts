import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { normalizeFileName, slugify } from '../utils/slugify';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

/**
 * Serviço para operações de arquivos no sistema.
 */
export class FileService {
  private storagePath: string;
  constructor() {
    this.storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
    this.ensureStoragePathExists();
  }
  private async ensureStoragePathExists(): Promise<void> {
    try {
      if (!(await exists(this.storagePath))) {
        await mkdir(this.storagePath, { recursive: true });
      }
    } catch (error: unknown) {
      throw new Error('Failed to create storage directory');
    }
  }
  /**
   * Garante que os diretórios de propriedade e categoria existem.
   */
  public async ensureDirectoryExists(propertySlug: string, categorySlug: string): Promise<void> {
    const propertyPath = path.join(this.storagePath, propertySlug);
    const categoryPath = path.join(propertyPath, categorySlug);
    try {
      if (!(await exists(propertyPath))) {
        await mkdir(propertyPath, { recursive: true });
      }
      if (!(await exists(categoryPath))) {
        await mkdir(categoryPath, { recursive: true });
      }
    } catch (error: unknown) {
      throw new Error(`Falha ao criar diretórios. Verifique as permissões em ${this.storagePath}`);
    }
  }
  /**
   * Move um arquivo dentro do storage.
   */
  public async moveFile(oldRelativePath: string, newRelativePath: string): Promise<void> {
    const oldFullPath = path.join(this.storagePath, oldRelativePath);
    const newFullPath = path.join(this.storagePath, newRelativePath);
    try {
      if (!(await exists(oldFullPath))) {
        throw new Error(`Arquivo de origem não encontrado: ${oldFullPath}`);
      }
      const newDir = path.dirname(newFullPath);
      if (!(await exists(newDir))) {
        await mkdir(newDir, { recursive: true });
      }
      const fileData = await fs.promises.readFile(oldFullPath);
      await fs.promises.writeFile(newFullPath, fileData);
      await unlink(oldFullPath);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao mover arquivo: ${errorMessage}`);
    }
  }
  /**
   * Salva um arquivo no diretório correto.
   */
  public async saveFile(
    file: Express.Multer.File,
    propertySlug: string,
    categorySlug: string,
    customFileName?: string
  ): Promise<{ fileName: string, filePath: string }> {
    try {
      propertySlug = propertySlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      categorySlug = categorySlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
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
      await writeFile(filePath, file.buffer);
      return {
        fileName: normalizedFileName,
        filePath: path.join(propertySlug, categorySlug, normalizedFileName)
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao salvar arquivo: ${errorMessage}`);
    }
  }
  /**
   * Exclui um arquivo do storage.
   */
  public async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.storagePath, filePath);
    try {
      if (await exists(fullPath)) {
        await unlink(fullPath);
      }
    } catch (error: unknown) {
      throw new Error('Failed to delete file');
    }
  }
  /**
   * Retorna o caminho absoluto de um arquivo.
   */
  public getFullPath(filePath: string): string {
    return path.join(this.storagePath, filePath);
  }
  /**
   * Retorna o diretório base de storage.
   */
  public getStoragePath(): string {
    return this.storagePath;
  }
}