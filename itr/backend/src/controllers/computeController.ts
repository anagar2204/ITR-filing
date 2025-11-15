/**
 * Compute Controller - Full Tax Computation with Deductions
 * Integrates all income sources and deductions for complete tax calculation
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import Decimal from 'decimal.js';
import { run, get, query } from '../config/database';
import { TaxRulesEngine, TaxCalculationInput } from '../services/taxRulesEngine';
import { logger } from '../utils/logger';

// Configure Decimal.js
Decimal.set({ precision: 28, rounding: 4 });

const toPaise = (amount: any): number => {
  const num = typeof amount === 'string' ? 
    parseFloat(amount.replace(/[₹$,\s]/g, '')) : 
    (typeof amount === 'number' ? amount : 0);
  return Math.round(num * 100);
};

const toRupees = (paise: number): number => {
  return Math.round(paise / 100);
};

const generateCorrelationId = (): string => {
  return crypto.randomBytes(8).toString('hex');
};

const generateInputHash = (data: any): string => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

export class ComputeController {
  
  // POST /api/v1/compute/with-deductions
  static async computeWithDeductions(req: Request, res: Response) {
    const correlationId = generateCorrelationId();
    
    try {
      const { userId, ay, idempotencyKey } = req.body;
      
      if (!userId || !ay) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: [{ field: 'userId,ay', message: 'userId and ay are required', code: 'VALIDATION_ERROR' }]
        });
      }

      if (!['2024-25', '2025-26'].includes(ay)) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: [{ field: 'ay', message: 'Invalid assessment year. Must be 2024-25 or 2025-26', code: 'VALIDATION_ERROR' }]
        });
      }

      // Fetch all income data
      const salaryData = get(
        'SELECT * FROM income_salary WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const interestData = get(
        'SELECT * FROM income_interest WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const capitalGainsData = get(
        'SELECT * FROM income_capital_gains WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const propertyData = get(
        'SELECT * FROM income_property WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const cryptoData = get(
        'SELECT * FROM income_crypto WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const otherData = get(
        'SELECT * FROM income_other WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      // Fetch all deductions data
      const deductions80C = get(
        'SELECT * FROM deductions_80c WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const deductions80D = get(
        'SELECT * FROM deductions_80d WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const taxesPaid = get(
        'SELECT * FROM deductions_taxes_paid WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const carryForward = get(
        'SELECT * FROM deductions_carry_forward WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      const otherDeductions = get(
        'SELECT * FROM deductions_other WHERE user_id = ? AND assessment_year = ?',
        [userId, ay]
      ) as any;

      // Prepare computation input
      const computationInput = {
        userId,
        ay,
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
          section80C: deductions80C ? toRupees(deductions80C.total_amount_paise || 0) : 0,
          section80D: deductions80D ? toRupees(deductions80D.total_amount_paise || 0) : 0,
          section80TTA: 0, // Will be included in otherDeductions
          section80CCD: 0, // Will be included in otherDeductions
          other: otherDeductions ? toRupees(otherDeductions.total_amount_paise || 0) : 0
        },
        taxesPaid: {
          tds: (salaryData ? toRupees(salaryData.tds_deducted || 0) : 0) +
               (interestData ? toRupees(interestData.total_tds || 0) : 0) +
               (cryptoData ? toRupees(cryptoData.tds_deducted || 0) : 0) +
               (otherData ? toRupees(otherData.tds_deducted || 0) : 0) +
               (taxesPaid ? toRupees(taxesPaid.total_tds_paise || 0) : 0),
          tcs: taxesPaid ? toRupees(taxesPaid.total_tcs_paise || 0) : 0,
          advanceTax: 0
        },
        carryForwardLosses: carryForward ? JSON.parse(carryForward.available_offsets || '{}') : {}
      };

      // Generate input hash for idempotency
      const inputHash = generateInputHash(computationInput);

      // Check for existing computation with same input hash
      const existingComputation = get(
        'SELECT * FROM computation_runs WHERE user_id = ? AND assessment_year = ? AND input_hash = ? ORDER BY created_at DESC LIMIT 1',
        [userId, ay, inputHash]
      ) as any;

      if (existingComputation) {
        logger.info(`Returning cached computation for user ${userId}, AY ${ay}`, { correlationId });
        return res.status(200).json({
          success: true,
          data: JSON.parse(existingComputation.computation_data),
          cached: true,
          runId: existingComputation.id
        });
      }

      // Perform tax calculations for both regimes
      const oldRegimeInput: TaxCalculationInput = {
        assessmentYear: ay as '2024-25' | '2025-26',
        regime: 'old',
        ageGroup: 'general', // Could be parameterized
        incomes: computationInput.incomes,
        deductions: computationInput.deductions,
        tdsAndTcs: computationInput.taxesPaid
      };

      const newRegimeInput: TaxCalculationInput = {
        assessmentYear: ay as '2024-25' | '2025-26',
        regime: 'new',
        ageGroup: 'general',
        incomes: computationInput.incomes,
        deductions: {
          section80C: 0, // New regime doesn't allow most deductions
          section80D: 0,
          section80TTA: 0,
          section80CCD: 0,
          other: 0
        },
        tdsAndTcs: computationInput.taxesPaid
      };

      const oldRegimeResult = TaxRulesEngine.calculate(oldRegimeInput);
      const newRegimeResult = TaxRulesEngine.calculate(newRegimeInput);

      // Determine recommended regime
      const recommendedRegime = newRegimeResult.breakdown.totalTaxLiability <= oldRegimeResult.breakdown.totalTaxLiability ? 'new' : 'old';
      const savings = Math.abs(oldRegimeResult.breakdown.totalTaxLiability - newRegimeResult.breakdown.totalTaxLiability);

      // Apply carry-forward losses if any
      let netTaxLiability = recommendedRegime === 'old' ? oldRegimeResult.breakdown.totalTaxLiability : newRegimeResult.breakdown.totalTaxLiability;
      const appliedLosses: any = {};

      if (carryForward) {
        const availableOffsets = JSON.parse(carryForward.available_offsets || '{}');
        // Simplified loss set-off logic - in practice, this would be more complex
        const totalLossOffset: number = Object.values(availableOffsets as Record<string, number>).reduce((sum: number, loss: number) => sum + toRupees(loss), 0);
        const taxSavingsFromLosses = Math.min(netTaxLiability, totalLossOffset * 0.3); // Assuming 30% tax rate
        netTaxLiability = Math.max(0, netTaxLiability - taxSavingsFromLosses);
        
        if (taxSavingsFromLosses > 0) {
          appliedLosses.totalOffset = totalLossOffset;
          appliedLosses.taxSavings = taxSavingsFromLosses;
        }
      }

      // Calculate final refund or tax due
      const totalTaxPaid = computationInput.taxesPaid.tds + computationInput.taxesPaid.tcs + computationInput.taxesPaid.advanceTax;
      const refundOrDue = totalTaxPaid - netTaxLiability;

      // Calculate gross income properly
      const grossIncome = computationInput.incomes.salary + 
                         computationInput.incomes.interest + 
                         computationInput.incomes.capitalGains.shortTerm + 
                         computationInput.incomes.capitalGains.longTerm + 
                         computationInput.incomes.property + 
                         computationInput.incomes.crypto + 
                         computationInput.incomes.other - 
                         computationInput.incomes.exempt;

      const totalDeductions = computationInput.deductions.section80C + 
                             computationInput.deductions.section80D + 
                             computationInput.deductions.section80TTA + 
                             computationInput.deductions.section80CCD + 
                             computationInput.deductions.other;

      // Prepare comprehensive tax summary
      const taxSummary = {
        runId: uuidv4(),
        userId,
        assessmentYear: ay,
        computedAt: new Date().toISOString(),
        inputHash,
        
        // Income breakdown
        incomeBreakdown: {
          salary: computationInput.incomes.salary,
          interest: computationInput.incomes.interest,
          capitalGains: computationInput.incomes.capitalGains.shortTerm + computationInput.incomes.capitalGains.longTerm,
          property: computationInput.incomes.property,
          crypto: computationInput.incomes.crypto,
          other: computationInput.incomes.other,
          exempt: computationInput.incomes.exempt,
          grossIncome: grossIncome
        },

        // Deductions breakdown
        deductionsBreakdown: {
          section80C: computationInput.deductions.section80C,
          section80D: computationInput.deductions.section80D,
          otherDeductions: computationInput.deductions.other,
          totalDeductions: totalDeductions
        },

        // Regime comparison
        regimeComparison: {
          oldRegime: {
            taxableIncome: oldRegimeResult.breakdown.taxableIncome,
            totalTaxLiability: oldRegimeResult.breakdown.totalTaxLiability,
            breakdown: oldRegimeResult.breakdown
          },
          newRegime: {
            taxableIncome: newRegimeResult.breakdown.taxableIncome,
            totalTaxLiability: newRegimeResult.breakdown.totalTaxLiability,
            breakdown: newRegimeResult.breakdown
          },
          recommended: recommendedRegime,
          savings: Math.round(savings)
        },

        // Final computation
        finalComputation: {
          recommendedRegime,
          taxableIncome: recommendedRegime === 'old' ? oldRegimeResult.breakdown.taxableIncome : newRegimeResult.breakdown.taxableIncome,
          taxBeforeRebate: recommendedRegime === 'old' ? oldRegimeResult.breakdown.slabTax : newRegimeResult.breakdown.slabTax,
          rebate: recommendedRegime === 'old' ? oldRegimeResult.breakdown.rebate87A : newRegimeResult.breakdown.rebate87A,
          surcharge: recommendedRegime === 'old' ? oldRegimeResult.breakdown.surcharge : newRegimeResult.breakdown.surcharge,
          cess: recommendedRegime === 'old' ? oldRegimeResult.breakdown.cess : newRegimeResult.breakdown.cess,
          taxAfterAll: netTaxLiability,
          appliedLosses,
          taxAlreadyPaid: totalTaxPaid,
          refundDue: refundOrDue > 0 ? refundOrDue : 0,
          taxPayable: refundOrDue < 0 ? Math.abs(refundOrDue) : 0
        },

        // Audit trail
        auditTrail: {
          appliedRules: recommendedRegime === 'old' ? oldRegimeResult.appliedRules : newRegimeResult.appliedRules,
          slabBreakdown: recommendedRegime === 'old' ? oldRegimeResult.slabBreakdown : newRegimeResult.slabBreakdown,
          computationSteps: [
            `Gross Income: ₹${grossIncome.toLocaleString()}`,
            `Total Deductions: ₹${totalDeductions.toLocaleString()}`,
            `Taxable Income: ₹${(recommendedRegime === 'old' ? oldRegimeResult.breakdown.taxableIncome : newRegimeResult.breakdown.taxableIncome).toLocaleString()}`,
            `Tax Before Rebate: ₹${(recommendedRegime === 'old' ? oldRegimeResult.breakdown.slabTax : newRegimeResult.breakdown.slabTax).toLocaleString()}`,
            `Rebate u/s 87A: ₹${(recommendedRegime === 'old' ? oldRegimeResult.breakdown.rebate87A : newRegimeResult.breakdown.rebate87A).toLocaleString()}`,
            `Surcharge: ₹${(recommendedRegime === 'old' ? oldRegimeResult.breakdown.surcharge : newRegimeResult.breakdown.surcharge).toLocaleString()}`,
            `Cess: ₹${(recommendedRegime === 'old' ? oldRegimeResult.breakdown.cess : newRegimeResult.breakdown.cess).toLocaleString()}`,
            `Final Tax Liability: ₹${netTaxLiability.toLocaleString()}`,
            `Tax Already Paid: ₹${totalTaxPaid.toLocaleString()}`,
            refundOrDue > 0 ? `Refund Due: ₹${refundOrDue.toLocaleString()}` : `Tax Payable: ₹${Math.abs(refundOrDue).toLocaleString()}`
          ]
        }
      };

      // Save computation to database
      try {
        run(`
          INSERT INTO computation_runs (
            id, user_id, assessment_year, computation_data, input_hash, status
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          taxSummary.runId, userId, ay, JSON.stringify(taxSummary), inputHash, 'completed'
        ]);

        logger.info(`Tax computation completed for user ${userId}, AY ${ay}`, { 
          correlationId, 
          runId: taxSummary.runId,
          recommendedRegime,
          finalTax: netTaxLiability
        });

        res.status(200).json({
          success: true,
          data: taxSummary,
          runId: taxSummary.runId
        });

      } catch (dbError) {
        logger.error('Database error saving computation:', dbError, { correlationId });
        // Still return the computation even if save fails
        res.status(200).json({
          success: true,
          data: taxSummary,
          runId: taxSummary.runId,
          warning: 'Computation completed but not saved to database'
        });
      }

    } catch (error) {
      logger.error('Error in tax computation:', error, { correlationId });
      res.status(500).json({
        success: false,
        correlationId,
        errors: [{ field: 'computation', message: 'Internal server error during tax calculation', code: 'COMPUTATION_ERROR' }]
      });
    }
  }

  // GET /api/v1/compute/saved/{runId}
  static async getSavedComputation(req: Request, res: Response) {
    try {
      const { runId } = req.params;
      
      const computation = get(
        'SELECT * FROM computation_runs WHERE id = ?',
        [runId]
      ) as any;

      if (!computation) {
        return res.status(404).json({
          success: false,
          errors: [{ field: 'runId', message: 'Computation not found', code: 'NOT_FOUND' }]
        });
      }

      res.status(200).json({
        success: true,
        data: JSON.parse(computation.computation_data)
      });

    } catch (error) {
      logger.error('Error fetching saved computation:', error);
      res.status(500).json({
        success: false,
        errors: [{ field: 'server', message: 'Internal server error', code: 'INTERNAL_ERROR' }]
      });
    }
  }
}
