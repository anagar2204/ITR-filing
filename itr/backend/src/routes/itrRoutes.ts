import express from 'express';
import {
  savePersonalInfo,
  saveIncomeSources,
  saveTaxSaving,
  getTaxSummary,
  finalizeITR,
  getAuditTrail
} from '../controllers/itrController';

const router = express.Router();

// ITR Filing Routes
router.post('/personal-info', savePersonalInfo);
router.post('/income-sources', saveIncomeSources);
router.post('/tax-saving', saveTaxSaving);
router.get('/summary', getTaxSummary);
router.post('/finalize', finalizeITR);
router.get('/audit/:auditId', getAuditTrail);

export default router;
