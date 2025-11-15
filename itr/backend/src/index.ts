import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/authRoutes';
import taxRoutes from './routes/taxRoutes';
import documentRoutes from './routes/documentRoutes';
import itrRoutes from './routes/itrRoutes';
import incomeSourceRoutes from './routes/incomeSourceRoutes';
import taxSavingsRoutes from './routes/taxSavingsRoutes';
import taxCalculationRoutes from './routes/taxCalculationRoutes';
import form16Routes from './routes/form16Routes';
import testUserRoutes from './routes/testUserRoutes';
import dataValidationRoutes from './routes/dataValidationRoutes';
import interestSummaryRoutes from './routes/interestSummary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2050;

// Initialize database
(async () => {
  await initDatabase();
})();

// Create uploads directories
const uploadsDir = path.join(__dirname, '../uploads');
const form16Dir = path.join(uploadsDir, 'form16');
const incomeDocumentsDir = path.join(uploadsDir, 'income-documents');
const taxDocumentsDir = path.join(uploadsDir, 'tax-documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(form16Dir)) {
  fs.mkdirSync(form16Dir, { recursive: true });
}
if (!fs.existsSync(incomeDocumentsDir)) {
  fs.mkdirSync(incomeDocumentsDir, { recursive: true });
}
if (!fs.existsSync(taxDocumentsDir)) {
  fs.mkdirSync(taxDocumentsDir, { recursive: true });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:6461',
    'http://localhost:6461',
    'http://localhost:2000',
    'http://127.0.0.1:6461',
    'http://127.0.0.1:2000',
    'http://127.0.0.1:50953',
    'http://localhost:50953'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', form16Routes);
app.use('/api/itr', itrRoutes);
app.use('/api/income-sources', incomeSourceRoutes);
app.use('/api/tax-savings', taxSavingsRoutes);
app.use('/api/tax-calculation', taxCalculationRoutes);
app.use('/api/form16', form16Routes);
app.use('/api/test-users', testUserRoutes);
app.use('/api/data-validation', dataValidationRoutes);
app.use('/api/v1/interest-summary', interestSummaryRoutes);

// Capital gains routes
const capitalGainsRoutes = require('./routes/capitalGains');
app.use('/api/capital-gains', capitalGainsRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
