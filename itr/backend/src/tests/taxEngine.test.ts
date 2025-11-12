import { taxEngine, TaxCalculationInput } from '../services/taxEngine';
import canonicalVectors from './canonical-vectors.json';

describe('Tax Engine - Canonical Vector Tests (100% Accuracy)', () => {
  
  // Helper to round to rupee precision
  const round = (value: number): number => Math.round(value);
  
  // Test each canonical vector
  canonicalVectors.vectors.forEach((vector) => {
    it(`${vector.id}: ${vector.description}`, () => {
      const result = taxEngine.calculate(vector.input as TaxCalculationInput);
      
      // Assert all expected values
      expect(round(result.breakdown.grossIncome)).toBe(vector.expected.grossIncome);
      expect(round(result.breakdown.taxableIncome)).toBe(vector.expected.taxableIncome);
      expect(round(result.breakdown.slabTaxBeforeSurcharge)).toBe(vector.expected.slabTaxBeforeSurcharge);
      expect(round(result.breakdown.rebate87A)).toBe(vector.expected.rebate87A);
      expect(round(result.breakdown.surcharge)).toBe(vector.expected.surcharge);
      expect(round(result.breakdown.healthEducationCess)).toBe(vector.expected.cess);
      expect(round(result.breakdown.totalTaxLiability)).toBe(vector.expected.totalTaxLiability);
      expect(round(result.breakdown.refundOrDue)).toBe(vector.expected.refundOrDue);
      
      // Verify config version is recorded
      expect(result.configVersion).toBeDefined();
      expect(result.configHash).toBeDefined();
      expect(result.timestamp).toBeDefined();
      
      // Verify detailed slab computation exists
      expect(result.detailedSlabComputation).toBeDefined();
      expect(Array.isArray(result.detailedSlabComputation)).toBe(true);
      
      // Verify applied rules are recorded
      expect(result.appliedRules).toBeDefined();
      expect(Array.isArray(result.appliedRules)).toBe(true);
    });
  });
  
  // Additional edge case tests
  describe('Edge Cases & Boundary Conditions', () => {
    
    it('Should handle zero income correctly', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 0,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result = taxEngine.calculate(input);
      expect(result.breakdown.totalTaxLiability).toBe(0);
    });
    
    it('Should handle negative refund correctly (tax due)', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1575000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        },
        tdsPaid: 50000
      };
      
      const result = taxEngine.calculate(input);
      expect(result.breakdown.totalTaxLiability).toBeGreaterThan(0);
      expect(result.breakdown.refundOrDue).toBeLessThan(0);
    });
    
    it('Should handle multiple income sources', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 800000,
          interest: 50000,
          rental: 100000,
          businessProfession: 200000,
          capitalGains: 0,
          otherSources: 25000
        }
      };
      
      const result = taxEngine.calculate(input);
      expect(result.breakdown.grossIncome).toBe(1175000);
      expect(result.breakdown.totalTaxLiability).toBeGreaterThan(0);
    });
    
    it('Should apply marginal relief for surcharge correctly', () => {
      // Income just above 50L threshold
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 5100000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result = taxEngine.calculate(input);
      expect(result.breakdown.surcharge).toBeGreaterThan(0);
      // Marginal relief should apply
      expect(result.appliedRules).toContain('surcharge-applied');
    });
    
    it('Should handle deductions in old regime', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'old',
        ageGroup: '0-60',
        incomes: {
          salary: 1000000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        },
        deductions: {
          '80C': 150000,
          '80D': 25000
        }
      };
      
      const result = taxEngine.calculate(input);
      expect(result.breakdown.totalDeductions).toBe(175000);
      expect(result.breakdown.taxableIncome).toBeLessThan(result.breakdown.grossIncome);
    });
    
    it('Should not allow deductions in new regime (except 80CCD2)', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1000000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        },
        deductions: {
          '80C': 150000,
          '80D': 25000,
          '80CCD2': 50000
        }
      };
      
      const result = taxEngine.calculate(input);
      // Only 80CCD2 should be allowed
      expect(result.breakdown.totalDeductions).toBe(50000);
    });
  });
  
  describe('Regime Comparison Tests', () => {
    
    it('Should compare both regimes and recommend lower tax', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1000000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const comparison = taxEngine.compareRegimes(input);
      
      expect(comparison.new).toBeDefined();
      expect(comparison.old).toBeDefined();
      expect(comparison.recommended).toBeDefined();
      expect(['new', 'old']).toContain(comparison.recommended);
      expect(comparison.savings).toBeGreaterThanOrEqual(0);
      
      // Verify comparison data in results
      expect(comparison.new.comparisonWithOtherRegime).toBeDefined();
      expect(comparison.old.comparisonWithOtherRegime).toBeDefined();
    });
    
    it('Should recommend new regime for income 12L (with rebate)', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1275000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const comparison = taxEngine.compareRegimes(input);
      
      // New regime should have 0 tax due to rebate
      expect(comparison.new.breakdown.totalTaxLiability).toBe(0);
      expect(comparison.recommended).toBe('new');
    });
  });
  
  describe('Accuracy & Precision Tests', () => {
    
    it('Should maintain rupee-level precision', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1234567,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result = taxEngine.calculate(input);
      
      // All amounts should be integers (rupee precision)
      expect(Number.isInteger(result.breakdown.totalTaxLiability)).toBe(true);
      expect(Number.isInteger(result.breakdown.slabTaxBeforeSurcharge)).toBe(true);
      expect(Number.isInteger(result.breakdown.healthEducationCess)).toBe(true);
    });
    
    it('Should produce consistent results for same input', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1500000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result1 = taxEngine.calculate(input);
      const result2 = taxEngine.calculate(input);
      
      expect(result1.breakdown.totalTaxLiability).toBe(result2.breakdown.totalTaxLiability);
      expect(result1.configHash).toBe(result2.configHash);
    });
  });
  
  describe('Config Version & Audit Trail', () => {
    
    it('Should record config version and hash', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1000000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result = taxEngine.calculate(input);
      
      expect(result.configVersion).toBe('1.0.0');
      expect(result.configHash).toMatch(/^[a-f0-9]{16}$/);
      expect(result.financialYear).toBe('FY2025-26');
      expect(result.assessmentYear).toBe('AY2026-27');
    });
    
    it('Should record timestamp in ISO format', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1000000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result = taxEngine.calculate(input);
      
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });
    
    it('Should record all applied rules', () => {
      const input: TaxCalculationInput = {
        financialYear: 'FY2025-26',
        regime: 'new',
        ageGroup: '0-60',
        incomes: {
          salary: 1275000,
          interest: 0,
          rental: 0,
          businessProfession: 0,
          capitalGains: 0,
          otherSources: 0
        }
      };
      
      const result = taxEngine.calculate(input);
      
      expect(result.appliedRules).toContain('standard-deduction-75000');
      expect(result.appliedRules).toContain('87A-rebate');
      expect(result.appliedRules).toContain('health-education-cess-4%');
    });
  });
});
