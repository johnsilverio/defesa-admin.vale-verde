/**
 * Converte um texto para formato de slug
 * Ex: "Defesa Administrativa" -> "defesa-administrativa"
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/\s+/g, '-')  // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres especiais
    .replace(/--+/g, '-')  // Substitui múltiplos hífens por um único
    .replace(/^-+/, '')  // Remove hífens no início
    .replace(/-+$/, '');  // Remove hífens no final
};

/**
 * Normaliza um nome de arquivo para armazenamento
 * Ex: "Documento Legal (2023).pdf" -> "documento-legal-2023.pdf"
 */
export const normalizeFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop() || '';
  const baseName = fileName.substring(0, fileName.length - extension.length - 1);
  const slugifiedName = slugify(baseName);
  return `${slugifiedName}.${extension.toLowerCase()}`;
};