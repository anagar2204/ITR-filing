import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { query, run, get } from '../config/database';
import {
  compareTaxRegimes,
  calculateHRAExemption,
  optimizeDeductions,
  TaxInput
} from '../services/taxCalculator';

const calculateTaxSchema = Joi.object({
  returnId: Joi.string().optional(),
  salaryGross: Joi.number().min(0).required(),
  salaryExempt: Joi.number().min(0).optional(),
  otherIncome: Joi.number().min(0).optional(),
  deductions: Joi.object({
    section80C: Joi.number().min(0).max(150000).optional(),
    section80D: Joi.number().min(0).max(25000).optional(),
    section80E: Joi.number().min(0).optional(),
    section80G: Joi.number().min(0).optional(),
    hraClaimed: Joi.number().min(0).optional()
  }).optional()
});

const hraCalculatorSchema = Joi.object({
  basicSalary: Joi.number().min(0).required(),
  hra: Joi.number().min(0).required(),
  rentPaid: Joi.number().min(0).required(),
  isMetro: Joi.boolean().required()
});

/**
 * Calculate tax for both regimes
 */
export const calculateTax = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { error, value } = calculateTaxSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const userId = req.user.id;
    const input: TaxInput = {
      salaryGross: value.salaryGross,
      salaryExempt: value.salaryExempt,
      otherIncome: value.otherIncome,
      deductions: value.deductions
    };

    // Calculate tax comparison
    const comparison = compareTaxRegimes(input);

    // If returnId provided, save to database
    if (value.returnId) {
      // Verify return belongs to user
      const returnRecord: any = get(
        'SELECT id FROM tax_returns WHERE id = ? AND user_id = ?',
        [value.returnId, userId]
      );

      if (!returnRecord) {
        throw new AppError('Tax return not found', 404);
      }

      // Save income data
      const incomeId = uuidv4();
      run(
        `INSERT OR REPLACE INTO income_data 
         (id, return_id, salary_gross, salary_exempt, salary_net, other_income)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          incomeId,
          value.returnId,
          value.salaryGross,
          value.salaryExempt || 0,
          value.salaryGross - (value.salaryExempt || 0),
          value.otherIncome || 0
        ]
      );

      // Save deductions
      if (value.deductions) {
        const deductionId = uuidv4();
        run(
          `INSERT OR REPLACE INTO deductions 
           (id, return_id, section_80c, section_80d, section_80e, section_80g, hra_claimed)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            deductionId,
            value.returnId,
            value.deductions.section80C || 0,
            value.deductions.section80D || 0,
            value.deductions.section80E || 0,
            value.deductions.section80G || 0,
            value.deductions.hraClaimed || 0
          ]
        );
      }

      // Save tax computations for both regimes
      ['old', 'new'].forEach((regime) => {
        const result = regime === 'old' ? comparison.old : comparison.new;
        const computationId = uuidv4();
        
        run(
          `INSERT OR REPLACE INTO tax_computations 
           (id, return_id, regime, total_income, taxable_income, tax_before_rebate, 
            rebate_87a, tax_payable, cess, total_tax)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            computationId,
            value.returnId,
            regime,
            result.totalIncome,
            result.taxableIncome,
            result.taxBeforeRebate,
            result.rebate87A,
            result.taxPayable,
            result.cess,
            result.totalTax
          ]
        );
      });

      logger.info(`Tax calculated for return ${value.returnId}`);
    }

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate HRA exemption
 */
export const calculateHRA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = hraCalculatorSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const exemption = calculateHRAExemption(
      value.basicSalary,
      value.hra,
      value.rentPaid,
      value.isMetro
    );

    res.json({
      success: true,
      data: {
        hraReceived: value.hra,
        exemptAmount: Math.round(exemption),
        taxableAmount: Math.round(value.hra - exemption),
        calculation: {
          actualHRA: value.hra,
          salaryPercentage: Math.round(value.basicSalary * (value.isMetro ? 0.50 : 0.40)),
          rentMinusTenPercent: Math.round(Math.max(0, value.rentPaid - (value.basicSalary * 0.10))),
          exemption: Math.round(exemption)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deduction optimization suggestions
 */
export const getDeductionSuggestions = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { salaryGross, deductions } = req.body;

    if (!salaryGross || salaryGross < 0) {
      throw new AppError('Valid salary amount is required', 400);
    }

    const optimization = optimizeDeductions(salaryGross, deductions);

    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new tax return
 */
export const createReturn = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { assessmentYear, financialYear, taxRegime } = req.body;

    if (!assessmentYear || !financialYear) {
      throw new AppError('Assessment year and financial year are required', 400);
    }

    const returnId = uuidv4();
    run(
      `INSERT INTO tax_returns 
       (id, user_id, assessment_year, financial_year, itr_form_type, tax_regime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [returnId, userId, assessmentYear, financialYear, 'ITR-1', taxRegime || 'new', 'draft']
    );

    logger.info(`Tax return created: ${returnId} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        returnId,
        assessmentYear,
        financialYear,
        itrFormType: 'ITR-1',
        taxRegime: taxRegime || 'new',
        status: 'draft'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's tax returns
 */
export const getReturns = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const returns = query(
      `SELECT id, assessment_year, financial_year, itr_form_type, tax_regime, status, created_at
       FROM tax_returns
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: returns
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific return details
 */
export const getReturnDetails = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { returnId } = req.params;

    // Get return
    const returnData: any = get(
      `SELECT * FROM tax_returns WHERE id = ? AND user_id = ?`,
      [returnId, userId]
    );

    if (!returnData) {
      throw new AppError('Tax return not found', 404);
    }

    // Get income data
    const income: any = get(
      'SELECT * FROM income_data WHERE return_id = ?',
      [returnId]
    );

    // Get deductions
    const deductions: any = get(
      'SELECT * FROM deductions WHERE return_id = ?',
      [returnId]
    );

    // Get tax computations
    const computations = query(
      'SELECT * FROM tax_computations WHERE return_id = ?',
      [returnId]
    );

    res.json({
      success: true,
      data: {
        return: returnData,
        income,
        deductions,
        computations
      }
    });
  } catch (error) {
    next(error);
  }
};
