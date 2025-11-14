import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/form16');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed.'));
    }
  }
});

// In-memory storage for upload progress and parsed data
const uploadProgress = new Map<string, any>();
const parsedData = new Map<string, any>();

interface ParsedForm16Data {
  employerDetails: {
    name: string;
    tan: string;
    address: string;
  };
  employeeDetails: {
    name: string;
    pan: string;
    designation: string;
    address: string;
  };
  salaryDetails: {
    basicSalary: number;
    hra: number;
    allowances: number;
    bonuses: number;
    grossSalary: number;
  };
  deductions: {
    epfEmployee: number;
    professionalTax: number;
    tds: number;
    totalDeductions: number;
  };
  taxDetails: {
    taxableIncome: number;
    taxDeducted: number;
    taxPayable: number;
  };
  period: {
    fromDate: string;
    toDate: string;
    financialYear: string;
  };
}

export class Form16Controller {
  
  /**
   * Upload Form 16 files
   */
  async uploadForm16(req: Request, res: Response) {
    try {
      const uploadId = uuidv4();
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Initialize upload progress
      const fileProgress = files.map(file => ({
        fileId: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        status: 'uploading',
        progress: 0
      }));

      uploadProgress.set(uploadId, {
        files: fileProgress,
        status: 'processing',
        createdAt: new Date()
      });

      // Start processing files asynchronously
      this.processFiles(uploadId, files, fileProgress);

      res.json({
        success: true,
        uploadId,
        message: 'Files uploaded successfully. Processing started.',
        files: fileProgress.map(f => ({
          fileId: f.fileId,
          name: f.originalName,
          status: f.status
        }))
      });

    } catch (error) {
      console.error('Form 16 upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload Form 16',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get upload status and progress
   */
  async getUploadStatus(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;
      const progress = uploadProgress.get(uploadId);

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Upload not found'
        });
      }

      res.json({
        success: true,
        data: progress
      });

    } catch (error) {
      console.error('Get upload status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get upload status'
      });
    }
  }

  /**
   * Apply parsed Form 16 data to user's tax information
   */
  async applyParsedData(req: Request, res: Response) {
    try {
      const { uploadId, fileId, userId = 'default-user' } = req.body;
      
      const parsed = parsedData.get(`${uploadId}-${fileId}`);
      if (!parsed) {
        return res.status(404).json({
          success: false,
          message: 'Parsed data not found'
        });
      }

      // Apply to salary income
      const { salaryIncomes } = require('./incomeSourceController');
      const salaryData = {
        id: uuidv4(),
        userId,
        basicSalary: parsed.salaryDetails.basicSalary,
        hra: parsed.salaryDetails.hra,
        allowances: parsed.salaryDetails.allowances,
        bonuses: parsed.salaryDetails.bonuses,
        epfEmployee: parsed.deductions.epfEmployee,
        professionalTax: parsed.deductions.professionalTax,
        rentPaid: 0, // Not available in Form 16
        cityType: 'metro', // Default
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existingSalary = salaryIncomes.get(userId) || [];
      salaryIncomes.set(userId, [...existingSalary, salaryData]);

      // Apply to tax paid (TDS)
      const { taxesPaidTDSTCS } = require('./taxSavingsController');
      const tdsData = {
        id: Date.now().toString(),
        userId,
        salaryTDS: parsed.deductions.tds,
        otherTDS: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      taxesPaidTDSTCS.set(userId, tdsData);

      res.json({
        success: true,
        message: 'Form 16 data applied successfully',
        appliedData: {
          salaryData,
          tdsData
        }
      });

    } catch (error) {
      console.error('Apply parsed data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply parsed data'
      });
    }
  }

  /**
   * Process uploaded files (mock OCR/parsing)
   */
  private async processFiles(uploadId: string, files: Express.Multer.File[], fileProgress: any[]) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = fileProgress[i];
      
      try {
        // Update status to parsing
        progress.status = 'parsing';
        progress.progress = 25;

        // Simulate OCR processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock parsed data (in real implementation, this would use OCR)
        const mockParsedData: ParsedForm16Data = {
          employerDetails: {
            name: "Tech Solutions Pvt Ltd",
            tan: "BLRT12345A",
            address: "123 Business Park, Bangalore"
          },
          employeeDetails: {
            name: "John Doe",
            pan: "ABCDE1234F",
            designation: "Software Engineer",
            address: "456 Residential Area, Bangalore"
          },
          salaryDetails: {
            basicSalary: 600000,
            hra: 200000,
            allowances: 50000,
            bonuses: 100000,
            grossSalary: 950000
          },
          deductions: {
            epfEmployee: 72000,
            professionalTax: 2400,
            tds: 45000,
            totalDeductions: 119400
          },
          taxDetails: {
            taxableIncome: 830600,
            taxDeducted: 45000,
            taxPayable: 45000
          },
          period: {
            fromDate: "2024-04-01",
            toDate: "2025-03-31",
            financialYear: "2024-25"
          }
        };

        // Store parsed data
        parsedData.set(`${uploadId}-${progress.fileId}`, mockParsedData);
        
        // Update progress
        progress.status = 'done';
        progress.progress = 100;
        progress.parsedData = mockParsedData;
        progress.confidence = 95; // Mock confidence score

      } catch (error) {
        progress.status = 'failed';
        progress.error = 'Failed to parse Form 16';
        console.error(`Failed to process file ${file.originalname}:`, error);
      }
    }

    // Update overall status
    const overallProgress = uploadProgress.get(uploadId);
    if (overallProgress) {
      overallProgress.status = 'completed';
      overallProgress.completedAt = new Date();
    }
  }

  /**
   * Get parsed data for a specific file
   */
  async getParsedData(req: Request, res: Response) {
    try {
      const { uploadId, fileId } = req.params;
      const parsed = parsedData.get(`${uploadId}-${fileId}`);

      if (!parsed) {
        return res.status(404).json({
          success: false,
          message: 'Parsed data not found'
        });
      }

      res.json({
        success: true,
        data: parsed
      });

    } catch (error) {
      console.error('Get parsed data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get parsed data'
      });
    }
  }
}

export const form16Controller = new Form16Controller();
export const uploadMiddleware = upload.array('files', 5); // Max 5 files
