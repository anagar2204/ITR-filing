import { Router } from 'express';
import {
  calculateTax,
  calculateHRA,
  getDeductionSuggestions,
  createReturn,
  getReturns,
  getReturnDetails
} from '../controllers/taxController';
import { calculateTaxHandler, getTaxSlabs } from '../controllers/taxCalculatorController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required for calculator)
router.post('/calculator/calculate', calculateTaxHandler);
router.get('/calculator/slabs', getTaxSlabs);

// All other routes require authentication
router.use(authenticate);

// Tax calculation
router.post('/calculate', calculateTax);
router.post('/calculate-hra', calculateHRA);
router.post('/optimize-deductions', getDeductionSuggestions);

// Tax returns management
router.post('/returns', createReturn);
router.get('/returns', getReturns);
router.get('/returns/:returnId', getReturnDetails);

export default router;
