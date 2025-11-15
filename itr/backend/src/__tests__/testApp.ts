/**
 * Test App Configuration - Separate from main server
 */

import express from 'express';
import cors from 'cors';
import { initDatabase } from '../config/database';
import { errorHandler } from '../middleware/errorHandler';
import deductionsRoutes from '../routes/deductionsRoutes';
import incomeSourceRoutes from '../routes/incomeSourceRoutes';

const createTestApp = async () => {
  await initDatabase();
  
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/v1/deductions', deductionsRoutes);
  app.use('/api/income-sources', incomeSourceRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
};

export default createTestApp;
