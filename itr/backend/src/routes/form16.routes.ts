import express from 'express'
import multer from 'multer'
import path from 'path'
import { uploadForm16, getUploadStatus, applyParsedData } from '../controllers/form16.controller'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/form16/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'))
    }
  }
})

// Routes
router.post('/uploads/form16', upload.array('files', 5), uploadForm16)
router.get('/uploads/:uploadId/status', getUploadStatus)
router.post('/form16/apply', applyParsedData)

export default router
