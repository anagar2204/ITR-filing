/**
 * Tax Calculator Controller
 * Handles HTTP requests for tax calculation
 */

import { Request, Response } from 'express';
import { calculateTax, validateTaxInput, TaxInput } from '../services/taxCalculationService';
import { logger } from '../utils/logger';

/**
 * POST /api/tax/calculate
 * Calculate tax for given input
 */
export const calculateTaxHandler = async (req: Request, res: Response) => {
  try {
    const input: TaxInput = req.body;
    
    // Log request (without PII)
    logger.info('Tax calculation request', {
      fy: input.fy,
      ageGroup: input.ageGroup,
      hasIncomes: !!input.incomes,
      hasDeductions: !!input.deductions,
    });
    
    // Validate input
    const validation = validateTaxInput(input);
    if (!validation.valid) {
      logger.warn('Tax calculation validation failed', { errors: validation.errors });
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }
    
    // Calculate tax
    const result = calculateTax(input);
    
    // Log result (summary only)
    logger.info('Tax calculation completed', {
      oldRegimeTax: result.oldRegime.netTax,
      newRegimeTax: result.newRegime.netTax,
      savings: result.savings,
      recommended: result.recommendedRegime,
    });
    
    // Return result
    return res.status(200).json({
      success: true,
      data: result,
    });
    
  } catch (error: any) {
    logger.error('Tax calculation error', {
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * GET /api/tax/slabs
 * Get tax slabs for a specific FY and regime
 */
export const getTaxSlabs = async (req: Request, res: Response) => {
  try {
    const { fy, regime } = req.query;
    
    if (!fy || !['2024-25', '2025-26'].includes(fy as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid financial year',
      });
    }
    
    if (!regime || !['old', 'new'].includes(regime as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid regime',
      });
    }
    
    // Return slab information
    const slabInfo = {
      fy,
      regime,
      slabs: regime === 'new' 
        ? (fy === '2024-25' 
          ? [
              { min: 0, max: 300000, rate: 0 },
              { min: 300000, max: 600000, rate: 5 },
              { min: 600000, max: 900000, rate: 10 },
              { min: 900000, max: 1200000, rate: 15 },
              { min: 1200000, max: 1500000, rate: 20 },
              { min: 1500000, max: null, rate: 30 },
            ]
          : [
              { min: 0, max: 300000, rate: 0 },
              { min: 300000, max: 700000, rate: 5 },
              { min: 700000, max: 1000000, rate: 10 },
              { min: 1000000, max: 1200000, rate: 15 },
              { min: 1200000, max: 1500000, rate: 20 },
              { min: 1500000, max: null, rate: 30 },
            ])
        : [
            { min: 0, max: 250000, rate: 0 },
            { min: 250000, max: 500000, rate: 5 },
            { min: 500000, max: 1000000, rate: 20 },
            { min: 1000000, max: null, rate: 30 },
          ],
    };
    
    return res.status(200).json({
      success: true,
      data: slabInfo,
    });
    
  } catch (error: any) {
    logger.error('Get tax slabs error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
