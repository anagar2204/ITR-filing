import { Router } from 'express';
import { taxCalculationController } from '../controllers/taxCalculationController';
import { simpleTaxSummaryController } from '../controllers/simpleTaxSummaryController';

const router = Router();

/**
 * @route POST /api/tax-calculation/calculate
 * @description Calculate tax for specific regime and financial year
 * @body { userId, regime, financialYear, incomeData?, deductionData?, taxesPaidData? }
 */
router.post('/calculate', taxCalculationController.calculateTax.bind(taxCalculationController));

/**
 * @route POST /api/tax-calculation/compare-regimes
 * @description Compare Old vs New tax regimes and get recommendation
 * @body { userId, financialYear }
 */
router.post('/compare-regimes', taxCalculationController.compareRegimes.bind(taxCalculationController));

/**
 * @route GET /api/tax-calculation/summary
 * @description Get comprehensive tax summary with both regimes
 * @query userId, financialYear?
 */
router.get('/summary', taxCalculationController.getTaxSummary.bind(taxCalculationController));

/**
 * @route GET /api/tax-calculation/debug
 * @description Debug data fetching for integration testing
 * @query userId
 */
router.get('/debug', taxCalculationController.debugDataFetch.bind(taxCalculationController));

/**
 * @route GET /api/tax-calculation/validate
 * @description Validate tax calculation engine with test cases
 */
router.get('/validate', taxCalculationController.validateCalculation.bind(taxCalculationController));

/**
 * @route GET /api/tax-calculation/pdf-receipt
 * @description Generate PDF receipt for tax calculation
 * @query userId, financialYear?
 */
router.get('/pdf-receipt', taxCalculationController.generateTaxReceiptPDF.bind(taxCalculationController));

/**
 * @route GET /api/tax-calculation/simple-summary
 * @description Get simple tax summary based on user data only
 * @query userId, financialYear?
 */
router.get('/simple-summary', simpleTaxSummaryController.getTaxSummary.bind(simpleTaxSummaryController));

export default router;
