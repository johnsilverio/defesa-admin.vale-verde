"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFileName = exports.slugify = void 0;
/**
 * Converte um texto para formato de slug
 * Ex: "Defesa Administrativa" -> "defesa-administrativa"
 */
const slugify = (text) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .toLowerCase()
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/[^\w-]+/g, '') // Remove caracteres especiais
        .replace(/--+/g, '-') // Substitui múltiplos hífens por um único
        .replace(/^-+/, '') // Remove hífens no início
        .replace(/-+$/, ''); // Remove hífens no final
};
exports.slugify = slugify;
/**
 * Normaliza um nome de arquivo para armazenamento
 * Ex: "Documento Legal (2023).pdf" -> "documento-legal-2023.pdf"
 */
const normalizeFileName = (fileName) => {
    const extension = fileName.split('.').pop() || '';
    const baseName = fileName.substring(0, fileName.length - extension.length - 1);
    const slugifiedName = (0, exports.slugify)(baseName);
    return `${slugifiedName}.${extension.toLowerCase()}`;
};
exports.normalizeFileName = normalizeFileName;
