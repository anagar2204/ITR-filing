import { Router } from 'express';
import {
  uploadDocument,
  parseForm16Document,
  getDocuments,
  getDocumentDetails,
  deleteDocument,
  downloadDocument
} from '../controllers/documentController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Document management
router.post('/upload', upload.single('file'), uploadDocument);
router.post('/:documentId/parse-form16', parseForm16Document);
router.get('/', getDocuments);
router.get('/:documentId', getDocumentDetails);
router.get('/:documentId/download', downloadDocument);
router.delete('/:documentId', deleteDocument);

export default router;
