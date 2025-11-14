import { Router } from 'express';
import { form16Controller, uploadMiddleware } from '../controllers/form16Controller';

const router = Router();

/**
 * @route POST /api/form16/upload
 * @description Upload Form 16 files for OCR processing
 * @body multipart/form-data with files
 */
router.post('/upload', uploadMiddleware, form16Controller.uploadForm16.bind(form16Controller));

/**
 * @route GET /api/form16/status/:uploadId
 * @description Get upload and processing status
 * @param uploadId - Upload session ID
 */
router.get('/status/:uploadId', form16Controller.getUploadStatus.bind(form16Controller));

/**
 * @route POST /api/form16/apply
 * @description Apply parsed Form 16 data to user's tax information
 * @body { uploadId, fileId, userId? }
 */
router.post('/apply', form16Controller.applyParsedData.bind(form16Controller));

/**
 * @route GET /api/form16/parsed/:uploadId/:fileId
 * @description Get parsed data for a specific file
 * @param uploadId - Upload session ID
 * @param fileId - File ID
 */
router.get('/parsed/:uploadId/:fileId', form16Controller.getParsedData.bind(form16Controller));

export default router;
