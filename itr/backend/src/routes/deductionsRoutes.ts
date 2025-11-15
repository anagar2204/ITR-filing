/**
 * Deductions Routes - AY-Aware Deduction Endpoints
 */

import express from 'express';
import { DeductionsController } from '../controllers/deductionsController';
import { ComputeController } from '../controllers/computeController';

const router = express.Router();

// Section 80C deductions
router.post('/80c', DeductionsController.save80C);

// Section 80D deductions
router.post('/80d', DeductionsController.save80D);

// Taxes paid (TDS/TCS)
router.post('/taxes-paid', DeductionsController.saveTaxesPaid);

// Carry forward losses
router.post('/carry-forward', DeductionsController.saveCarryForward);

// Other deductions
router.post('/other', DeductionsController.saveOtherDeductions);

// Compute with deductions
router.post('/compute/with-deductions', ComputeController.computeWithDeductions);

// Get saved computation
router.get('/compute/saved/:runId', ComputeController.getSavedComputation);

export default router;
