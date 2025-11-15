/**
 * Deductions Controller - AY-Aware Implementation
 * Handles all deduction types with proper validation and persistence
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import crypto from 'crypto';
import Decimal from 'decimal.js';
import { run, get, query } from '../config/database';
import { logger } from '../utils/logger';

// Configure Decimal.js
Decimal.set({ precision: 28, rounding: 4 });

// Utility functions
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

// AY-specific rules
const AY_RULES = {
  '2024-25': {
    section80C: { cap: 150000 },
    section80D: { 
      selfFamilyCap: 25000,
      selfFamilyCapSenior: 50000,
      parentsCap: 25000,
      parentsCapSenior: 50000,
      preventiveCheckupCap: 5000
    },
    section80TTA: { cap: 10000 },
    section80TTB: { cap: 50000 }, // For senior citizens
    section80E: { cap: null }, // No cap
    section80G: { cap: null }, // Varies by donation type
    section80CCD: { cap: 50000 }
  },
  '2025-26': {
    section80C: { cap: 150000 },
    section80D: { 
      selfFamilyCap: 25000,
      selfFamilyCapSenior: 50000,
      parentsCap: 25000,
      parentsCapSenior: 50000,
      preventiveCheckupCap: 5000
    },
    section80TTA: { cap: 10000 },
    section80TTB: { cap: 50000 },
    section80E: { cap: null },
    section80G: { cap: null },
    section80CCD: { cap: 50000 }
  }
};

// Validation schemas
const section80CSchema = Joi.object({
  userId: Joi.string().required(),
  ay: Joi.string().valid('2024-25', '2025-26').required(),
  idempotencyKey: Joi.string().optional(),
  components: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('PPF', 'ELSS', 'LifeInsurance', 'HomeLoanPrincipal', 'NSC', 'ULIP', 'TaxSaver_FD', 'Other').required(),
      amount: Joi.alternatives().try(Joi.number(), Joi.string()).required()
    })
  ).required()
});

const section80DSchema = Joi.object({
  userId: Joi.string().required(),
  ay: Joi.string().valid('2024-25', '2025-26').required(),
  idempotencyKey: Joi.string().optional(),
  premiums: Joi.array().items(
    Joi.object({
      for: Joi.string().valid('self', 'family', 'parents').required(),
      ageBracket: Joi.string().valid('<60', '60+').required(),
      amount: Joi.alternatives().try(Joi.number(), Joi.string()).required()
    })
  ).required(),
  preventiveCheckupsAmount: Joi.alternatives().try(Joi.number(), Joi.string()).default(0)
});

const taxesPaidSchema = Joi.object({
  userId: Joi.string().required(),
  ay: Joi.string().valid('2024-25', '2025-26').required(),
  idempotencyKey: Joi.string().optional(),
  tdsEntries: Joi.array().items(
    Joi.object({
      source: Joi.string().required(),
      amount: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
      form26asReference: Joi.string().optional()
    })
  ).required(),
  tcsEntries: Joi.array().items(
    Joi.object({
      source: Joi.string().required(),
      amount: Joi.alternatives().try(Joi.number(), Joi.string()).required()
    })
  ).default([])
});

const carryForwardSchema = Joi.object({
  userId: Joi.string().required(),
  ay: Joi.string().valid('2024-25', '2025-26').required(),
  idempotencyKey: Joi.string().optional(),
  losses: Joi.array().items(
    Joi.object({
      lossType: Joi.string().valid('STCL', 'LTCL', 'Business', 'Speculative').required(),
      yearOfLoss: Joi.string().required(),
      amount: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
      canBeSetOff: Joi.boolean().default(true)
    })
  ).required(),
  carryForwardYears: Joi.number().default(8)
});

const otherDeductionsSchema = Joi.object({
  userId: Joi.string().required(),
  ay: Joi.string().valid('2024-25', '2025-26').required(),
  idempotencyKey: Joi.string().optional(),
  entries: Joi.array().items(
    Joi.object({
      section: Joi.string().valid('80E', '80G', '80TTA', '80TTB', '80CCD', '80GGA', '80U', '80DDB').required(),
      amount: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
      meta: Joi.object().default({})
    })
  ).required()
});

export class DeductionsController {
  
  // POST /api/v1/deductions/80c
  static async save80C(req: Request, res: Response) {
    const correlationId = generateCorrelationId();
    
    try {
      const { error, value } = section80CSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message, code: 'VALIDATION_ERROR' }))
        });
      }

      const { userId, ay, idempotencyKey, components } = value;
      const rules = AY_RULES[ay as keyof typeof AY_RULES];
      
      // Check for existing record with same idempotency key
      if (idempotencyKey) {
        const existing = get(
          'SELECT * FROM deductions_80c WHERE user_id = ? AND assessment_year = ? AND idempotency_key = ?',
          [userId, ay, idempotencyKey]
        ) as any;
        
        if (existing) {
          return res.status(200).json({
            success: true,
            id: existing.id,
            total80c: toRupees(existing.total_amount_paise),
            capApplied: existing.cap_applied === 1,
            savedComponents: JSON.parse(existing.components)
          });
        }
      }

      // Calculate total and apply cap
      const totalAmount = components.reduce((sum: number, comp: any) => sum + toPaise(comp.amount), 0);
      const cappedAmount = Math.min(totalAmount, toPaise(rules.section80C.cap));
      const capApplied = totalAmount > toPaise(rules.section80C.cap);

      const id = uuidv4();
      
      // Use transaction
      try {
        // Delete existing record for same user/AY
        run('DELETE FROM deductions_80c WHERE user_id = ? AND assessment_year = ?', [userId, ay]);
        
        // Insert new record
        run(`
          INSERT INTO deductions_80c (
            id, user_id, assessment_year, idempotency_key, components,
            total_amount_paise, cap_applied
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          id, userId, ay, idempotencyKey || null,
          JSON.stringify(components), cappedAmount, capApplied ? 1 : 0
        ]);

        logger.info(`80C deduction saved for user ${userId}, AY ${ay}`, { correlationId });

        res.status(200).json({
          success: true,
          id,
          total80c: toRupees(cappedAmount),
          capApplied,
          savedComponents: components
        });

      } catch (dbError) {
        logger.error('Database error saving 80C deduction:', dbError, { correlationId });
        res.status(500).json({
          success: false,
          correlationId,
          errors: [{ field: 'database', message: 'Failed to save 80C deduction', code: 'DB_ERROR' }]
        });
      }

    } catch (error) {
      logger.error('Error saving 80C deduction:', error, { correlationId });
      res.status(500).json({
        success: false,
        correlationId,
        errors: [{ field: 'server', message: 'Internal server error', code: 'INTERNAL_ERROR' }]
      });
    }
  }

  // POST /api/v1/deductions/80d
  static async save80D(req: Request, res: Response) {
    const correlationId = generateCorrelationId();
    
    try {
      const { error, value } = section80DSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message, code: 'VALIDATION_ERROR' }))
        });
      }

      const { userId, ay, idempotencyKey, premiums, preventiveCheckupsAmount } = value;
      const rules = AY_RULES[ay as keyof typeof AY_RULES];
      
      // Check for existing record
      if (idempotencyKey) {
        const existing = get(
          'SELECT * FROM deductions_80d WHERE user_id = ? AND assessment_year = ? AND idempotency_key = ?',
          [userId, ay, idempotencyKey]
        ) as any;
        
        if (existing) {
          return res.status(200).json({
            success: true,
            id: existing.id,
            total80d: toRupees(existing.total_amount_paise),
            capBreakdown: JSON.parse(existing.cap_breakdown)
          });
        }
      }

      // Calculate caps
      let selfFamilyTotal = 0;
      let parentsTotal = 0;
      let isSelfFamilySenior = false;
      let isParentsSenior = false;

      premiums.forEach((premium: any) => {
        const amount = toPaise(premium.amount);
        if (premium.for === 'self' || premium.for === 'family') {
          selfFamilyTotal += amount;
          if (premium.ageBracket === '60+') {
            isSelfFamilySenior = true;
          }
        } else if (premium.for === 'parents') {
          parentsTotal += amount;
          if (premium.ageBracket === '60+') {
            isParentsSenior = true;
          }
        }
      });

      const selfFamilyCap = isSelfFamilySenior ? 
        toPaise(rules.section80D.selfFamilyCapSenior) : 
        toPaise(rules.section80D.selfFamilyCap);
      
      const parentsCap = isParentsSenior ? 
        toPaise(rules.section80D.parentsCapSenior) : 
        toPaise(rules.section80D.parentsCap);

      const allowedSelfFamily = Math.min(selfFamilyTotal, selfFamilyCap);
      const allowedParents = Math.min(parentsTotal, parentsCap);
      const allowedPreventive = Math.min(toPaise(preventiveCheckupsAmount), toPaise(rules.section80D.preventiveCheckupCap));
      
      const totalAllowed = allowedSelfFamily + allowedParents + allowedPreventive;

      const capBreakdown = {
        selfFamily: { claimed: toRupees(selfFamilyTotal), allowed: toRupees(allowedSelfFamily), cap: toRupees(selfFamilyCap) },
        parents: { claimed: toRupees(parentsTotal), allowed: toRupees(allowedParents), cap: toRupees(parentsCap) },
        preventiveCheckup: { claimed: toRupees(toPaise(preventiveCheckupsAmount)), allowed: toRupees(allowedPreventive), cap: toRupees(toPaise(rules.section80D.preventiveCheckupCap)) }
      };

      const id = uuidv4();
      
      try {
        run('DELETE FROM deductions_80d WHERE user_id = ? AND assessment_year = ?', [userId, ay]);
        
        run(`
          INSERT INTO deductions_80d (
            id, user_id, assessment_year, idempotency_key, premiums,
            preventive_checkup_amount_paise, total_amount_paise, cap_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id, userId, ay, idempotencyKey || null,
          JSON.stringify(premiums), toPaise(preventiveCheckupsAmount),
          totalAllowed, JSON.stringify(capBreakdown)
        ]);

        logger.info(`80D deduction saved for user ${userId}, AY ${ay}`, { correlationId });

        res.status(200).json({
          success: true,
          id,
          total80d: toRupees(totalAllowed),
          capBreakdown
        });

      } catch (dbError) {
        logger.error('Database error saving 80D deduction:', dbError, { correlationId });
        res.status(500).json({
          success: false,
          correlationId,
          errors: [{ field: 'database', message: 'Failed to save 80D deduction', code: 'DB_ERROR' }]
        });
      }

    } catch (error) {
      logger.error('Error saving 80D deduction:', error, { correlationId });
      res.status(500).json({
        success: false,
        correlationId,
        errors: [{ field: 'server', message: 'Internal server error', code: 'INTERNAL_ERROR' }]
      });
    }
  }

  // POST /api/v1/deductions/taxes-paid
  static async saveTaxesPaid(req: Request, res: Response) {
    const correlationId = generateCorrelationId();
    
    try {
      const { error, value } = taxesPaidSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message, code: 'VALIDATION_ERROR' }))
        });
      }

      const { userId, ay, idempotencyKey, tdsEntries, tcsEntries } = value;
      
      // Check for existing record
      if (idempotencyKey) {
        const existing = get(
          'SELECT * FROM deductions_taxes_paid WHERE user_id = ? AND assessment_year = ? AND idempotency_key = ?',
          [userId, ay, idempotencyKey]
        ) as any;
        
        if (existing) {
          return res.status(200).json({
            success: true,
            id: existing.id,
            totalTDS: toRupees(existing.total_tds_paise),
            totalTCS: toRupees(existing.total_tcs_paise),
            entriesCount: { tds: JSON.parse(existing.tds_entries).length, tcs: JSON.parse(existing.tcs_entries).length }
          });
        }
      }

      const totalTDS = tdsEntries.reduce((sum: number, entry: any) => sum + toPaise(entry.amount), 0);
      const totalTCS = tcsEntries.reduce((sum: number, entry: any) => sum + toPaise(entry.amount), 0);

      const id = uuidv4();
      
      try {
        run('DELETE FROM deductions_taxes_paid WHERE user_id = ? AND assessment_year = ?', [userId, ay]);
        
        run(`
          INSERT INTO deductions_taxes_paid (
            id, user_id, assessment_year, idempotency_key, tds_entries,
            tcs_entries, total_tds_paise, total_tcs_paise
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id, userId, ay, idempotencyKey || null,
          JSON.stringify(tdsEntries), JSON.stringify(tcsEntries),
          totalTDS, totalTCS
        ]);

        logger.info(`Taxes paid saved for user ${userId}, AY ${ay}`, { correlationId });

        res.status(200).json({
          success: true,
          id,
          totalTDS: toRupees(totalTDS),
          totalTCS: toRupees(totalTCS),
          entriesCount: { tds: tdsEntries.length, tcs: tcsEntries.length }
        });

      } catch (dbError) {
        logger.error('Database error saving taxes paid:', dbError, { correlationId });
        res.status(500).json({
          success: false,
          correlationId,
          errors: [{ field: 'database', message: 'Failed to save taxes paid', code: 'DB_ERROR' }]
        });
      }

    } catch (error) {
      logger.error('Error saving taxes paid:', error, { correlationId });
      res.status(500).json({
        success: false,
        correlationId,
        errors: [{ field: 'server', message: 'Internal server error', code: 'INTERNAL_ERROR' }]
      });
    }
  }

  // POST /api/v1/deductions/carry-forward
  static async saveCarryForward(req: Request, res: Response) {
    const correlationId = generateCorrelationId();
    
    try {
      const { error, value } = carryForwardSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message, code: 'VALIDATION_ERROR' }))
        });
      }

      const { userId, ay, idempotencyKey, losses, carryForwardYears } = value;
      
      // Check for existing record
      if (idempotencyKey) {
        const existing = get(
          'SELECT * FROM deductions_carry_forward WHERE user_id = ? AND assessment_year = ? AND idempotency_key = ?',
          [userId, ay, idempotencyKey]
        ) as any;
        
        if (existing) {
          return res.status(200).json({
            success: true,
            id: existing.id,
            availableOffsets: JSON.parse(existing.available_offsets)
          });
        }
      }

      // Calculate available offsets based on carry-forward rules
      const currentAYYear = parseInt(ay.split('-')[0]);
      const availableOffsets: any = {
        STCL: 0,
        LTCL: 0,
        Business: 0,
        Speculative: 0
      };

      losses.forEach((loss: any) => {
        const lossYear = parseInt(loss.yearOfLoss.split('-')[0]);
        const yearsDiff = currentAYYear - lossYear;
        
        // Check if loss is still eligible for carry-forward (8 years limit)
        if (yearsDiff <= carryForwardYears && loss.canBeSetOff) {
          availableOffsets[loss.lossType] += toPaise(loss.amount);
        }
      });

      const id = uuidv4();
      
      try {
        run('DELETE FROM deductions_carry_forward WHERE user_id = ? AND assessment_year = ?', [userId, ay]);
        
        run(`
          INSERT INTO deductions_carry_forward (
            id, user_id, assessment_year, idempotency_key, losses, available_offsets
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          id, userId, ay, idempotencyKey || null,
          JSON.stringify(losses), JSON.stringify(availableOffsets)
        ]);

        logger.info(`Carry forward losses saved for user ${userId}, AY ${ay}`, { correlationId });

        res.status(200).json({
          success: true,
          id,
          availableOffsets: {
            STCL: toRupees(availableOffsets.STCL),
            LTCL: toRupees(availableOffsets.LTCL),
            Business: toRupees(availableOffsets.Business),
            Speculative: toRupees(availableOffsets.Speculative)
          }
        });

      } catch (dbError) {
        logger.error('Database error saving carry forward:', dbError, { correlationId });
        res.status(500).json({
          success: false,
          correlationId,
          errors: [{ field: 'database', message: 'Failed to save carry forward losses', code: 'DB_ERROR' }]
        });
      }

    } catch (error) {
      logger.error('Error saving carry forward:', error, { correlationId });
      res.status(500).json({
        success: false,
        correlationId,
        errors: [{ field: 'server', message: 'Internal server error', code: 'INTERNAL_ERROR' }]
      });
    }
  }

  // POST /api/v1/deductions/other
  static async saveOtherDeductions(req: Request, res: Response) {
    const correlationId = generateCorrelationId();
    
    try {
      const { error, value } = otherDeductionsSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          correlationId,
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message, code: 'VALIDATION_ERROR' }))
        });
      }

      const { userId, ay, idempotencyKey, entries } = value;
      const rules = AY_RULES[ay as keyof typeof AY_RULES];
      
      // Check for existing record
      if (idempotencyKey) {
        const existing = get(
          'SELECT * FROM deductions_other WHERE user_id = ? AND assessment_year = ? AND idempotency_key = ?',
          [userId, ay, idempotencyKey]
        ) as any;
        
        if (existing) {
          return res.status(200).json({
            success: true,
            id: existing.id,
            totalOtherDeductions: toRupees(existing.total_amount_paise),
            sectionBreakdown: JSON.parse(existing.section_breakdown)
          });
        }
      }

      // Apply section-specific caps and rules
      const sectionBreakdown: any = {};
      let totalAllowed = 0;

      entries.forEach((entry: any) => {
        const amount = toPaise(entry.amount);
        let allowedAmount = amount;

        // Apply section-specific caps
        switch (entry.section) {
          case '80TTA':
            allowedAmount = Math.min(amount, toPaise(rules.section80TTA.cap));
            break;
          case '80TTB':
            allowedAmount = Math.min(amount, toPaise(rules.section80TTB.cap));
            break;
          case '80CCD':
            allowedAmount = Math.min(amount, toPaise(rules.section80CCD.cap));
            break;
          case '80E':
            // No cap for education loan interest
            allowedAmount = amount;
            break;
          case '80G':
            // Donation rules - simplified (actual implementation would need donation type)
            allowedAmount = amount; // Would apply percentage limits based on donation type
            break;
          default:
            allowedAmount = amount;
        }

        const sectionRule = rules[`section${entry.section}` as keyof typeof rules] as any;
        sectionBreakdown[entry.section] = {
          claimed: toRupees(amount),
          allowed: toRupees(allowedAmount),
          cap: sectionRule?.cap || null
        };

        totalAllowed += allowedAmount;
      });

      const id = uuidv4();
      
      try {
        run('DELETE FROM deductions_other WHERE user_id = ? AND assessment_year = ?', [userId, ay]);
        
        run(`
          INSERT INTO deductions_other (
            id, user_id, assessment_year, idempotency_key, entries,
            total_amount_paise, section_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          id, userId, ay, idempotencyKey || null,
          JSON.stringify(entries), totalAllowed, JSON.stringify(sectionBreakdown)
        ]);

        logger.info(`Other deductions saved for user ${userId}, AY ${ay}`, { correlationId });

        res.status(200).json({
          success: true,
          id,
          totalOtherDeductions: toRupees(totalAllowed),
          sectionBreakdown
        });

      } catch (dbError) {
        logger.error('Database error saving other deductions:', dbError, { correlationId });
        res.status(500).json({
          success: false,
          correlationId,
          errors: [{ field: 'database', message: 'Failed to save other deductions', code: 'DB_ERROR' }]
        });
      }

    } catch (error) {
      logger.error('Error saving other deductions:', error, { correlationId });
      res.status(500).json({
        success: false,
        correlationId,
        errors: [{ field: 'server', message: 'Internal server error', code: 'INTERNAL_ERROR' }]
      });
    }
  }
}
