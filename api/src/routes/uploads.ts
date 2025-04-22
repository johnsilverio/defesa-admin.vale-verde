import { Router, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

// Configuração do multer com nomes personalizados para os arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Garante que o diretório existe
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Cria um nome de arquivo único com timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro para permitir apenas tipos específicos de arquivos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF e Word são aceitos.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  }
});

const router = Router();

// Upload de arquivos - apenas usuários autenticados
router.post('/', authenticate, upload.single('file'), ((req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: 'Nenhum arquivo enviado',
      code: 'NO_FILE' 
    });
  }
  
  res.status(201).json({ 
    success: true,
    filename: req.file.filename, 
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  });
}) as RequestHandler);

// Listar arquivos - apenas administradores
router.get('/', authenticate, requireAdmin, ((req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao listar arquivos', 
        code: 'LIST_ERROR',
        message: err.message 
      });
    }
    
    res.json({ files });
  });
}) as RequestHandler);

// Excluir arquivo - apenas administradores
router.delete('/:filename', authenticate, requireAdmin, ((req, res) => {
  const { filename } = req.params;
  const filePath = path.join('uploads', filename);
  
  // Verifica se o arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      error: 'Arquivo não encontrado', 
      code: 'FILE_NOT_FOUND' 
    });
  }
  
  // Tenta excluir o arquivo
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao excluir arquivo', 
        code: 'DELETE_ERROR',
        message: err.message 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Arquivo excluído com sucesso' 
    });
  });
}) as RequestHandler);

export default router;
