import express from 'express';
import { TaxSavingsController } from '../controllers/taxSavingsController';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/tax-documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|csv|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, images, and spreadsheet files are allowed'));
    }
  }
});

// Section 80C Routes
router.post('/section-80c', TaxSavingsController.createSection80C);
router.get('/section-80c', TaxSavingsController.getSection80C);
router.put('/section-80c/:id', TaxSavingsController.updateSection80C);

// Section 80D Routes
router.post('/section-80d', TaxSavingsController.createSection80D);
router.get('/section-80d', TaxSavingsController.getSection80D);

// Taxes Paid (TDS/TCS) Routes
router.post('/taxes-paid', TaxSavingsController.createTaxesPaid);
router.get('/taxes-paid', TaxSavingsController.getTaxesPaid);

// Carry Forward Losses Routes
router.post('/carry-forward-losses', TaxSavingsController.createCarryForwardLosses);
router.get('/carry-forward-losses', TaxSavingsController.getCarryForwardLosses);

// Other Deductions Routes
router.post('/other-deductions', TaxSavingsController.createOtherDeductions);
router.get('/other-deductions', TaxSavingsController.getOtherDeductions);

// Summary Route
router.get('/summary', TaxSavingsController.getTaxSavingsSummary);

// File Upload Routes
router.post('/upload/investment-proof', upload.single('investmentProof'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Investment proof uploaded successfully',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading investment proof',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/upload/insurance-policy', upload.single('insurancePolicy'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Insurance policy uploaded successfully',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading insurance policy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/upload/form26as', upload.single('form26AS'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Form 26AS uploaded successfully',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading Form 26AS',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/upload/tax-certificate', upload.single('taxCertificate'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Tax certificate uploaded successfully',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading tax certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/upload/previous-itr', upload.single('previousITR'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Previous ITR uploaded successfully',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading previous ITR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
