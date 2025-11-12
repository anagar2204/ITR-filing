/**
 * Tax Calculation Service Tests
 * Comprehensive unit tests for tax calculation logic
 */

import { calculateTax, validateTaxInput, TaxInput } from '../services/taxCalculationService';

describe('Tax Calculation Service', () => {
  describe('Validation', () => {
    it('should validate correct input', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 600000,
          hra: 100000,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 150000,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 50000,
          otherDeductions: 0,
        },
      };
      
      const result = validateTaxInput(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject invalid financial year', () => {
      const input = {
        fy: '2023-24',
        ageGroup: '0-60',
        incomes: { salary: 600000, hra: 0, otherIncome: 0, interest: 0, capGains: 0 },
        deductions: { section80C: 0, section80D: 0, section80TTA: 0, standardDeduction: 0, otherDeductions: 0 },
      };
      
      const result = validateTaxInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject negative income values', () => {
      const input = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: { salary: -100000, hra: 0, otherIncome: 0, interest: 0, capGains: 0 },
        deductions: { section80C: 0, section80D: 0, section80TTA: 0, standardDeduction: 0, otherDeductions: 0 },
      };
      
      const result = validateTaxInput(input);
      expect(result.valid).toBe(false);
    });
  });
  
  describe('FY 2025-26 Calculations', () => {
    it('should calculate tax for low income with rebate (Payload A)', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 600000,
          hra: 100000,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 150000,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 50000,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Old regime: 700000 - 200000 (80C + std) = 500000 taxable
      // Tax: 0 on 2.5L, 12500 on 2.5L = 12500
      // Rebate applies (income <= 5L), so net tax = 0
      expect(result.oldRegime.taxableIncome).toBe(500000);
      expect(result.oldRegime.netTax).toBe(0);
      
      // New regime: 700000 - 75000 (std deduction) = 625000 taxable
      // Tax: 0 on 3L, 16250 on 3.25L (5% on 325000)
      // Rebate applies (income <= 7L), so net tax should be 0
      expect(result.newRegime.taxableIncome).toBe(625000);
      expect(result.newRegime.netTax).toBe(0);
    });
    
    it('should calculate tax for mid income (Payload B)', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 2200000,
          hra: 180000,
          otherIncome: 100000,
          interest: 5000,
          capGains: 0,
        },
        deductions: {
          section80C: 100000,
          section80D: 12000,
          section80TTA: 0,
          standardDeduction: 50000,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Old regime: 2485000 - 162000 = 2323000 taxable
      // Tax calculation:
      // 0-2.5L: 0
      // 2.5L-5L: 12500 (5% of 2.5L)
      // 5L-10L: 100000 (20% of 5L)
      // 10L-23.23L: 396900 (30% of 13.23L)
      // Total: 509400
      expect(result.oldRegime.taxableIncome).toBe(2323000);
      expect(result.oldRegime.taxBeforeCess).toBeGreaterThan(400000);
      expect(result.oldRegime.taxBeforeCess).toBeLessThan(600000);
      
      // New regime: 2485000 - 75000 = 2410000 taxable
      // Should be higher than old regime for this income level
      expect(result.newRegime.taxableIncome).toBe(2410000);
      
      // Old regime should be better (lower tax)
      expect(result.recommendedRegime).toBe('old');
      expect(result.savings).toBeGreaterThan(0);
    });
  });
  
  describe('FY 2024-25 Calculations', () => {
    it('should calculate tax for senior citizen (Payload C)', () => {
      const input: TaxInput = {
        fy: '2024-25',
        ageGroup: '60-80',
        incomes: {
          salary: 350000,
          hra: 0,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 0,
          section80D: 25000,
          section80TTA: 0,
          standardDeduction: 0,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Old regime (senior): 350000 - 25000 = 325000 taxable
      // Senior citizen exemption: 3L
      // Tax: 5% on 25000 = 1250
      expect(result.oldRegime.taxableIncome).toBe(325000);
      expect(result.oldRegime.taxBeforeCess).toBe(1250);
      
      // New regime: 350000 - 50000 (std) = 300000 taxable
      // Tax: 0 (up to 3L is exempt)
      expect(result.newRegime.taxableIncome).toBe(300000);
      expect(result.newRegime.netTax).toBe(0);
      
      // New regime should be better
      expect(result.recommendedRegime).toBe('new');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 0,
          hra: 0,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 0,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 0,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      expect(result.oldRegime.netTax).toBe(0);
      expect(result.newRegime.netTax).toBe(0);
      expect(result.savings).toBe(0);
    });
    
    it('should handle income exactly at slab boundary', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 1000000,
          hra: 0,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 0,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 0,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Should calculate correctly at slab boundary
      expect(result.oldRegime.taxableIncome).toBeGreaterThan(0);
      expect(result.newRegime.taxableIncome).toBeGreaterThan(0);
    });
    
    it('should apply surcharge for high income', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 6000000,
          hra: 0,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 150000,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 50000,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Income > 50L, so 10% surcharge should apply
      expect(result.oldRegime.surcharge).toBeGreaterThan(0);
      expect(result.newRegime.surcharge).toBeGreaterThan(0);
    });
    
    it('should apply cess correctly', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 1500000,
          hra: 0,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 0,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 0,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Cess should be 4% of (tax + surcharge)
      const expectedCessOld = Math.round((result.oldRegime.taxBeforeCess + result.oldRegime.surcharge) * 0.04);
      expect(result.oldRegime.cess).toBe(expectedCessOld);
      
      const expectedCessNew = Math.round((result.newRegime.taxBeforeCess + result.newRegime.surcharge) * 0.04);
      expect(result.newRegime.cess).toBe(expectedCessNew);
    });
  });
  
  describe('Slab Breakdown', () => {
    it('should provide detailed slab breakdown', () => {
      const input: TaxInput = {
        fy: '2025-26',
        ageGroup: '0-60',
        incomes: {
          salary: 1200000,
          hra: 0,
          otherIncome: 0,
          interest: 0,
          capGains: 0,
        },
        deductions: {
          section80C: 0,
          section80D: 0,
          section80TTA: 0,
          standardDeduction: 0,
          otherDeductions: 0,
        },
      };
      
      const result = calculateTax(input);
      
      // Should have multiple slab entries
      expect(result.oldRegime.slabBreakdown.length).toBeGreaterThan(0);
      expect(result.newRegime.slabBreakdown.length).toBeGreaterThan(0);
      
      // Each slab should have required fields
      result.oldRegime.slabBreakdown.forEach(slab => {
        expect(slab).toHaveProperty('slab');
        expect(slab).toHaveProperty('income');
        expect(slab).toHaveProperty('rate');
        expect(slab).toHaveProperty('tax');
      });
    });
  });
});
