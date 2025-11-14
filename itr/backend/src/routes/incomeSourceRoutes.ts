import express from 'express';
import { IncomeSourceController } from '../controllers/incomeSourceController';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/income-documents'));
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

// Salary Income Routes
router.post('/salary', IncomeSourceController.createSalaryIncome);
router.get('/salary', IncomeSourceController.getSalaryIncome);
router.put('/salary/:id', IncomeSourceController.updateSalaryIncome);

// Interest Income Routes
router.post('/interest', IncomeSourceController.createInterestIncome);
router.get('/interest', IncomeSourceController.getInterestIncome);

// Capital Gains Routes
router.post('/capital-gains', IncomeSourceController.createCapitalGains);
router.get('/capital-gains', IncomeSourceController.getCapitalGains);

// House Property Routes
router.post('/house-property', IncomeSourceController.createHouseProperty);
router.get('/house-property', IncomeSourceController.getHouseProperty);

// Crypto/VDA Income Routes
router.post('/crypto-vda', IncomeSourceController.createCryptoVDAIncome);
router.get('/crypto-vda', IncomeSourceController.getCryptoVDAIncome);

// Other Income Routes
router.post('/other', IncomeSourceController.createOtherIncome);
router.get('/other', IncomeSourceController.getOtherIncome);

// Summary Route
router.get('/summary', IncomeSourceController.getIncomeSourceSummary);

// File Upload Routes
router.post('/upload/form16', upload.single('form16'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      data: { 
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

router.post('/upload/bank-statement', upload.single('bankStatement'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      data: { 
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

router.post('/upload/trading-statement', upload.single('tradingStatement'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      data: { 
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

export default router;
