import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { query, run, get } from '../config/database';
import { parseForm16, validateForm16Data } from '../services/documentParser';

/**
 * Upload document
 */
export const uploadDocument = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const userId = req.user.id;
    const { documentType, returnId } = req.body;

    if (!documentType) {
      throw new AppError('Document type is required', 400);
    }

    // Verify return belongs to user if returnId provided
    if (returnId) {
      const returnRecord: any = get(
        'SELECT id FROM tax_returns WHERE id = ? AND user_id = ?',
        [returnId, userId]
      );

      if (!returnRecord) {
        throw new AppError('Tax return not found', 404);
      }
    }

    const documentId = uuidv4();
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    // Save document metadata
    run(
      `INSERT INTO documents (id, user_id, return_id, document_type, file_name, file_path, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [documentId, userId, returnId || null, documentType, fileName, filePath, fileSize]
    );

    logger.info(`Document uploaded: ${documentId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        documentId,
        fileName,
        documentType,
        fileSize,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Parse Form 16
 */
export const parseForm16Document = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    // Get document
    const document: any = get(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.document_type !== 'form16') {
      throw new AppError('Document is not a Form 16', 400);
    }

    if (!fs.existsSync(document.file_path)) {
      throw new AppError('Document file not found', 404);
    }

    // Parse the document
    logger.info(`Parsing Form 16: ${documentId}`);
    const parsedData = await parseForm16(document.file_path);

    // Validate parsed data
    const validation = validateForm16Data(parsedData);
    if (!validation.isValid) {
      logger.warn(`Form 16 validation failed: ${validation.errors.join(', ')}`);
    }

    // Save parsed data
    run(
      'UPDATE documents SET parsed_data = ? WHERE id = ?',
      [JSON.stringify(parsedData), documentId]
    );

    // If return_id exists, auto-populate the return
    if (document.return_id) {
      await autoPopulateReturn(document.return_id, parsedData);
    }

    res.json({
      success: true,
      data: {
        parsed: parsedData,
        validation: validation,
        autoPopulated: !!document.return_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Auto-populate tax return from parsed Form 16
 */
async function autoPopulateReturn(returnId: string, form16Data: any) {
  try {
    // Update or insert income data
    const incomeId = uuidv4();
    run(
      `INSERT OR REPLACE INTO income_data 
       (id, return_id, salary_gross, salary_exempt, salary_net, other_income)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        incomeId,
        returnId,
        form16Data.grossSalary,
        0,
        form16Data.netSalary,
        0
      ]
    );

    // Update or insert deductions
    if (form16Data.deductions) {
      const deductionId = uuidv4();
      run(
        `INSERT OR REPLACE INTO deductions 
         (id, return_id, section_80c, section_80d, section_80e, hra_claimed)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          deductionId,
          returnId,
          form16Data.deductions.section80C || 0,
          form16Data.deductions.section80D || 0,
          form16Data.deductions.section80E || 0,
          form16Data.deductions.hra || 0
        ]
      );
    }

    logger.info(`Auto-populated return ${returnId} from Form 16`);
  } catch (error) {
    logger.error(`Failed to auto-populate return: ${error.message}`);
  }
}

/**
 * Get user's documents
 */
export const getDocuments = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { returnId } = req.query;

    let sql = 'SELECT id, document_type, file_name, file_size, created_at FROM documents WHERE user_id = ?';
    const params: any[] = [userId];

    if (returnId) {
      sql += ' AND return_id = ?';
      params.push(returnId);
    }

    sql += ' ORDER BY created_at DESC';

    const documents = query(sql, params);

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document details
 */
export const getDocumentDetails = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const document: any = get(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Parse the JSON parsed_data if it exists
    let parsedData = null;
    if (document.parsed_data) {
      try {
        parsedData = JSON.parse(document.parsed_data);
      } catch (e) {
        logger.error('Failed to parse document data JSON');
      }
    }

    res.json({
      success: true,
      data: {
        id: document.id,
        documentType: document.document_type,
        fileName: document.file_name,
        fileSize: document.file_size,
        parsedData: parsedData,
        uploadedAt: document.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const document: any = get(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    run('DELETE FROM documents WHERE id = ?', [documentId]);

    logger.info(`Document deleted: ${documentId}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download document
 */
export const downloadDocument = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const document: any = get(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!fs.existsSync(document.file_path)) {
      throw new AppError('Document file not found', 404);
    }

    res.download(document.file_path, document.file_name);
  } catch (error) {
    next(error);
  }
};
