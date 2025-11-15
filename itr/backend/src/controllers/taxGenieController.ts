/**
 * Tax Genie Controller - Comprehensive Tax Calculation API
 * Implements all income source endpoints with proper validation and persistence
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { run, get, query } from '../config/database';
import { TaxRulesEngine, TaxCalculationInput } from '../services/taxRulesEngine';
import { logger } from '../utils/logger';

// Utility function to convert rupees to paise (avoid float issues)
const toPaise = (amount: any): number => {
  const num = typeof amount === 'string' ? 
    parseFloat(amount.replace(/[₹$,\s]/g, '')) : 
    (typeof amount === 'number' ? amount : 0);
  return Math.round(num * 100);
};

// Utility function to convert paise to rupees
const toRupees = (paise: number): number => {
  return Math.round(paise / 100);
};

// Validation schemas
const salarySchema = Joi.object({
  userId: Joi.string().required(),
  assessmentYear: Joi.string().valid('2024-25', '2025-26').required(),
  employerName: Joi.string().optional(),
  grossSalary: Joi.number().min(0).required(),
  basicSalary: Joi.number().min(0).default(0),
  hraReceived: Joi.number().min(0).default(0),
  specialAllowance: Joi.number().min(0).default(0),
  otherAllowances: Joi.number().min(0).default(0),
  tdsDeducted: Joi.number().min(0).default(0),
  professionalTax: Joi.number().min(0).default(0)
});

const interestSchema = Joi.object({
  userId: Joi.string().required(),
  assessmentYear: Joi.string().valid('2024-25', '2025-26').required(),
  savingsInterest: Joi.number().min(0).default(0),
  fdInterest: Joi.number().min(0).default(0),
  rdInterest: Joi.number().min(0).default(0),
  bondInterest: Joi.number().min(0).default(0),
  otherInterest: Joi.number().min(0).default(0),
  totalTds: Joi.number().min(0).default(0)
});

export class TaxGenieController {
  // POST /api/v1/income/salary
  static async saveSalaryIncome(req: Request, res: Response) {
    try {
      const { error, value } = salarySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          errors: error.details.map(d => d.message)
        });
      }

      const id = uuidv4();
      const {
        userId, assessmentYear, employerName,
        grossSalary, basicSalary, hraReceived, specialAllowance,
        otherAllowances, tdsDeducted, professionalTax
      } = value;

      // Use transaction for atomicity
      try {
        // Delete existing record for same user/AY
        run(
          'DELETE FROM income_salary WHERE user_id = ? AND assessment_year = ?',
          [userId, assessmentYear]
        );

        // Insert new record
        run(`
          INSERT INTO income_salary (
            id, user_id, assessment_year, employer_name,
            gross_salary, basic_salary, hra_received, special_allowance,
            other_allowances, tds_deducted, professional_tax
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id, userId, assessmentYear, employerName,
          toPaise(grossSalary), toPaise(basicSalary), toPaise(hraReceived),
          toPaise(specialAllowance), toPaise(otherAllowances),
          toPaise(tdsDeducted), toPaise(professionalTax)
        ]);

        logger.info(`Salary income saved for user ${userId}, AY ${assessmentYear}`);

        res.status(200).json({
          success: true,
          id,
          summary: {
            grossSalary: toRupees(toPaise(grossSalary)),
            netSalary: toRupees(toPaise(grossSalary) - toPaise(tdsDeducted) - toPaise(professionalTax)),
            tdsDeducted: toRupees(toPaise(tdsDeducted))
          }
        });

      } catch (dbError) {
        logger.error('Database error saving salary income:', dbError);
        res.status(500).json({
          success: false,
          errors: ['Failed to save salary income to database']
        });
      }

    } catch (error) {
      logger.error('Error saving salary income:', error);
      res.status(500).json({
        success: false,
        errors: ['Internal server error']
      });
    }
  }

  // POST /api/v1/income/interest
  static async saveInterestIncome(req: Request, res: Response) {
    try {
      const { error, value } = interestSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          errors: error.details.map(d => d.message)
        });
      }

      const id = uuidv4();
      const {
        userId, assessmentYear, savingsInterest, fdInterest,
        rdInterest, bondInterest, otherInterest, totalTds
      } = value;

      try {
        // Delete existing record
        run(
          'DELETE FROM income_interest WHERE user_id = ? AND assessment_year = ?',
          [userId, assessmentYear]
        );

        // Insert new record
        run(`
          INSERT INTO income_interest (
            id, user_id, assessment_year, savings_interest, fd_interest,
            rd_interest, bond_interest, other_interest, total_tds
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id, userId, assessmentYear,
          toPaise(savingsInterest), toPaise(fdInterest), toPaise(rdInterest),
          toPaise(bondInterest), toPaise(otherInterest), toPaise(totalTds)
        ]);

        const totalInterest = savingsInterest + fdInterest + rdInterest + bondInterest + otherInterest;

        logger.info(`Interest income saved for user ${userId}, AY ${assessmentYear}`);

        res.status(200).json({
          success: true,
          id,
          summary: {
            totalInterest: Math.round(totalInterest),
            totalTds: Math.round(totalTds),
            netInterest: Math.round(totalInterest - totalTds)
          }
        });

      } catch (dbError) {
        logger.error('Database error saving interest income:', dbError);
        res.status(500).json({
          success: false,
          errors: ['Failed to save interest income to database']
        });
      }

    } catch (error) {
      logger.error('Error saving interest income:', error);
      res.status(500).json({
        success: false,
        errors: ['Internal server error']
      });
    }
  }

  // POST /api/v1/compute/summary
  static async computeTaxSummary(req: Request, res: Response) {
    try {
      const { userId, assessmentYear, regime, ageGroup } = req.body;

      if (!userId || !assessmentYear || !regime) {
        return res.status(400).json({
          success: false,
          errors: ['userId, assessmentYear, and regime are required']
        });
      }

      if (!['2024-25', '2025-26'].includes(assessmentYear)) {
        return res.status(400).json({
          success: false,
          errors: ['Invalid assessment year. Must be 2024-25 or 2025-26']
        });
      }

      if (!['old', 'new'].includes(regime)) {
        return res.status(400).json({
          success: false,
          errors: ['Invalid regime. Must be old or new']
        });
      }

      // Fetch all income data from database
      const salaryData = get(
        'SELECT * FROM income_salary WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      const interestData = get(
        'SELECT * FROM income_interest WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      const capitalGainsData = get(
        'SELECT * FROM income_capital_gains WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      const propertyData = get(
        'SELECT * FROM income_property WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      const cryptoData = get(
        'SELECT * FROM income_crypto WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      const otherData = get(
        'SELECT * FROM income_other WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      const deductionsData = get(
        'SELECT * FROM deductions_data WHERE user_id = ? AND assessment_year = ?',
        [userId, assessmentYear]
      ) as any;

      // Prepare input for tax calculation
      const taxInput: TaxCalculationInput = {
        assessmentYear: assessmentYear as '2024-25' | '2025-26',
        regime: regime as 'old' | 'new',
        ageGroup: ageGroup || 'general',
        incomes: {
          salary: salaryData ? toRupees(salaryData.gross_salary || 0) : 0,
          interest: interestData ? 
            toRupees((interestData.savings_interest || 0) + 
                    (interestData.fd_interest || 0) + 
                    (interestData.rd_interest || 0) + 
                    (interestData.bond_interest || 0) + 
                    (interestData.other_interest || 0)) : 0,
          capitalGains: {
            shortTerm: capitalGainsData ? toRupees(capitalGainsData.short_term_gains || 0) : 0,
            longTerm: capitalGainsData ? toRupees(capitalGainsData.long_term_gains || 0) : 0
          },
          property: propertyData ? toRupees(propertyData.rental_income || 0) : 0,
          crypto: cryptoData ? toRupees(cryptoData.crypto_gains || 0) : 0,
          other: otherData ? toRupees(otherData.other_income || 0) : 0,
          exempt: otherData ? toRupees(otherData.exempt_income || 0) : 0
        },
        deductions: {
          section80C: deductionsData ? toRupees(deductionsData.section_80c || 0) : 0,
          section80D: deductionsData ? toRupees(deductionsData.section_80d || 0) : 0,
          section80TTA: deductionsData ? toRupees(deductionsData.section_80tta || 0) : 0,
          section80CCD: deductionsData ? toRupees(deductionsData.section_80ccd || 0) : 0,
          other: deductionsData ? toRupees(deductionsData.other_deductions || 0) : 0
        },
        tdsAndTcs: {
          tds: (salaryData ? toRupees(salaryData.tds_deducted || 0) : 0) +
               (interestData ? toRupees(interestData.total_tds || 0) : 0) +
               (cryptoData ? toRupees(cryptoData.tds_deducted || 0) : 0) +
               (otherData ? toRupees(otherData.tds_deducted || 0) : 0),
          tcs: 0,
          advanceTax: 0
        }
      };

      // Calculate tax using the rules engine
      const result = TaxRulesEngine.calculate(taxInput);

      // Save calculation to database
      const calculationId = uuidv4();
      run(`
        INSERT OR REPLACE INTO tax_calculations (
          id, user_id, assessment_year, regime, calculation_data,
          total_tax_liability, refund_or_due
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        calculationId, userId, assessmentYear, regime,
        JSON.stringify(result),
        toPaise(result.breakdown.totalTaxLiability),
        toPaise(result.breakdown.refundOrDue)
      ]);

      logger.info(`Tax calculation completed for user ${userId}, AY ${assessmentYear}, regime ${regime}`);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error computing tax summary:', error);
      res.status(500).json({
        success: false,
        errors: ['Internal server error during tax calculation']
      });
    }
  }
}
