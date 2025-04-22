import { Request, Response, RequestHandler } from 'express';
import { documents } from '../models/document';

export function getDocuments(req: Request, res: Response) {
  res.json(documents);
}

export const uploadDocument: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, url, category } = req.body;
    const id = documents.length + 1;
    documents.push({ id, title, description, url, category });
    res.status(201).json({ message: 'Documento enviado com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Documento não encontrado' });
      return;
    }
    documents.splice(idx, 1);
    res.status(200).json({ message: 'Documento deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
