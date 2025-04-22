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
        await mkdir(this.storagePath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating storage directory:', error);
      throw new Error('Failed to create storage directory');
    }
  }
  
  /**
   * Ensures property and category directories exist
   */
  private async ensureDirectoryExists(propertySlug: string, categorySlug: string): Promise<void> {
    const propertyPath = path.join(this.storagePath, propertySlug);
    const categoryPath = path.join(propertyPath, categorySlug);
    
    try {
      if (!(await exists(propertyPath))) {
        await mkdir(propertyPath, { recursive: true });
      }
      
      if (!(await exists(categoryPath))) {
        await mkdir(categoryPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating directories:', error);
      throw new Error('Failed to create necessary directories');
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
    
    try {
      await writeFile(filePath, file.buffer);
      
      return {
        fileName: normalizedFileName,
        filePath: path.join(propertySlug, categorySlug, normalizedFileName)
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
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
      }
    } catch (error) {
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
} 