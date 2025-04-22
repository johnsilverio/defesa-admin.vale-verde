/**
 * Converts a string to a slug format
 * Example: "Defesa Administrativa" -> "defesa-administrativa"
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')  // normalize diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .toLowerCase()
    .replace(/\s+/g, '-')  // replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // remove non-word characters
    .replace(/--+/g, '-')  // replace multiple hyphens with a single hyphen
    .replace(/^-+/, '')  // trim hyphens from start
    .replace(/-+$/, '');  // trim hyphens from end
};

/**
 * Normalizes a filename for storage
 * Example: "Documento Legal (2023).pdf" -> "documento-legal-2023.pdf"
 */
export const normalizeFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop() || '';
  const baseName = fileName.substring(0, fileName.length - extension.length - 1);
  const slugifiedName = slugify(baseName);
  return `${slugifiedName}.${extension.toLowerCase()}`;
}; 