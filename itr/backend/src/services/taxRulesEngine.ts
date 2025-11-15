/**
 * Tax Rules Engine - Authoritative Implementation
 * Implements official Indian Income Tax rules for AY 2024-25 and AY 2025-26
 * Uses Assessment Year (AY) for rule selection as per requirement
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 28, rounding: 4 });

export interface TaxSlab {
  from: number;
  to: number | null;
  rate: number;
}

export interface SurchargeConfig {
  threshold: number;
  rate: number;
}

export interface TaxRuleSet {
  assessmentYear: string;
  financialYear: string;
  oldRegime: {
    slabs: {
      general: TaxSlab[];
      senior: TaxSlab[];
      superSenior: TaxSlab[];
    };
    standardDeduction: number;
    rebate87A: {
      maxIncome: number;
      maxRebate: number;
    };
  };
  newRegime: {
    slabs: TaxSlab[];
    standardDeduction: number;
    rebate87A: {
      maxIncome: number;
      maxRebate: number;
    };
  };
  surcharge: SurchargeConfig[];
  cess: {
    rate: number; // Health & Education Cess
  };
}

// AY 2024-25 (FY 2023-24) Tax Rules
const AY_2024_25_RULES: TaxRuleSet = {
  assessmentYear: '2024-25',
  financialYear: '2023-24',
  oldRegime: {
    slabs: {
      general: [
        { from: 0, to: 250000, rate: 0 },
        { from: 250000, to: 500000, rate: 5 },
        { from: 500000, to: 1000000, rate: 20 },
        { from: 1000000, to: null, rate: 30 }
      ],
      senior: [
        { from: 0, to: 300000, rate: 0 },
        { from: 300000, to: 500000, rate: 5 },
        { from: 500000, to: 1000000, rate: 20 },
        { from: 1000000, to: null, rate: 30 }
      ],
      superSenior: [
        { from: 0, to: 500000, rate: 0 },
        { from: 500000, to: 1000000, rate: 20 },
        { from: 1000000, to: null, rate: 30 }
      ]
    },
    standardDeduction: 50000,
    rebate87A: {
      maxIncome: 500000,
      maxRebate: 12500
    }
  },
  newRegime: {
    slabs: [
      { from: 0, to: 300000, rate: 0 },
      { from: 300000, to: 600000, rate: 5 },
      { from: 600000, to: 900000, rate: 10 },
      { from: 900000, to: 1200000, rate: 15 },
      { from: 1200000, to: 1500000, rate: 20 },
      { from: 1500000, to: null, rate: 30 }
    ],
    standardDeduction: 50000,
    rebate87A: {
      maxIncome: 700000,
      maxRebate: 25000
    }
  },
  surcharge: [
    { threshold: 5000000, rate: 10 },
    { threshold: 10000000, rate: 15 },
    { threshold: 20000000, rate: 25 },
    { threshold: 50000000, rate: 37 }
  ],
  cess: {
    rate: 4 // 4% Health & Education Cess
  }
};

// AY 2025-26 (FY 2024-25) Tax Rules - Updated with Budget 2025 changes
const AY_2025_26_RULES: TaxRuleSet = {
  assessmentYear: '2025-26',
  financialYear: '2024-25',
  oldRegime: {
    slabs: {
      general: [
        { from: 0, to: 250000, rate: 0 },
        { from: 250000, to: 500000, rate: 5 },
        { from: 500000, to: 1000000, rate: 20 },
        { from: 1000000, to: null, rate: 30 }
      ],
      senior: [
        { from: 0, to: 300000, rate: 0 },
        { from: 300000, to: 500000, rate: 5 },
        { from: 500000, to: 1000000, rate: 20 },
        { from: 1000000, to: null, rate: 30 }
      ],
      superSenior: [
        { from: 0, to: 500000, rate: 0 },
        { from: 500000, to: 1000000, rate: 20 },
        { from: 1000000, to: null, rate: 30 }
      ]
    },
    standardDeduction: 50000,
    rebate87A: {
      maxIncome: 500000,
      maxRebate: 12500
    }
  },
  newRegime: {
    slabs: [
      { from: 0, to: 300000, rate: 0 },
      { from: 300000, to: 700000, rate: 5 },
      { from: 700000, to: 1000000, rate: 10 },
      { from: 1000000, to: 1200000, rate: 15 },
      { from: 1200000, to: 1500000, rate: 20 },
      { from: 1500000, to: null, rate: 30 }
    ],
    standardDeduction: 75000, // Increased standard deduction for AY 2025-26
    rebate87A: {
      maxIncome: 700000,
      maxRebate: 25000
    }
  },
  surcharge: [
    { threshold: 5000000, rate: 10 },
    { threshold: 10000000, rate: 15 },
    { threshold: 20000000, rate: 25 },
    { threshold: 50000000, rate: 37 }
  ],
  cess: {
    rate: 4 // 4% Health & Education Cess
  }
};

export interface TaxCalculationInput {
  assessmentYear: '2024-25' | '2025-26';
  regime: 'old' | 'new';
  ageGroup: 'general' | 'senior' | 'superSenior';
  incomes: {
    salary: number;
    interest: number;
    capitalGains: {
      shortTerm: number;
      longTerm: number;
    };
    property: number;
    crypto: number;
    other: number;
    exempt: number;
  };
  deductions: {
    section80C: number;
    section80D: number;
    section80TTA: number;
    section80CCD: number;
    other: number;
  };
  tdsAndTcs: {
    tds: number;
    tcs: number;
    advanceTax: number;
  };
}

export interface TaxCalculationResult {
  assessmentYear: string;
  regime: string;
  ageGroup: string;
  breakdown: {
    grossIncome: number;
    exemptIncome: number;
    totalIncome: number;
    standardDeduction: number;
    totalDeductions: number;
    taxableIncome: number;
    slabTax: number;
    rebate87A: number;
    taxAfterRebate: number;
    surcharge: number;
    marginalRelief: number;
    taxAfterSurcharge: number;
    cess: number;
    totalTaxLiability: number;
    totalTaxPaid: number;
    refundOrDue: number;
  };
  slabBreakdown: Array<{
    from: number;
    to: number | null;
    rate: number;
    taxableAmount: number;
    tax: number;
  }>;
  appliedRules: string[];
}

export class TaxRulesEngine {
  private static getRules(assessmentYear: string): TaxRuleSet {
    switch (assessmentYear) {
      case '2024-25':
        return AY_2024_25_RULES;
      case '2025-26':
        return AY_2025_26_RULES;
      default:
        throw new Error(`Unsupported assessment year: ${assessmentYear}`);
    }
  }

  private static normalizeAmount(amount: any): number {
    if (typeof amount === 'string') {
      // Remove currency symbols, commas, and spaces
      const cleaned = amount.replace(/[₹$,\s]/g, '');
      return cleaned === '' || isNaN(Number(cleaned)) ? 0 : Number(cleaned);
    }
    return typeof amount === 'number' ? amount : 0;
  }

  private static calculateSlabTax(
    taxableIncome: number,
    slabs: TaxSlab[]
  ): { tax: number; breakdown: Array<any> } {
    const breakdown: Array<any> = [];
    let totalTax = new Decimal(0);

    for (const slab of slabs) {
      if (taxableIncome <= slab.from) break;

      const slabEnd = slab.to || Infinity;
      const taxableInSlab = Math.min(taxableIncome, slabEnd) - slab.from;

      if (taxableInSlab > 0) {
        const taxInSlab = new Decimal(taxableInSlab).mul(slab.rate).div(100);
        totalTax = totalTax.plus(taxInSlab);

        breakdown.push({
          from: slab.from,
          to: slab.to,
          rate: slab.rate,
          taxableAmount: taxableInSlab,
          tax: taxInSlab.toNumber()
        });
      }
    }

    return {
      tax: totalTax.toNumber(),
      breakdown
    };
  }

  private static calculateSurcharge(
    taxableIncome: number,
    baseTax: number,
    surchargeConfig: SurchargeConfig[]
  ): { surcharge: number; marginalRelief: number } {
    let surchargeRate = 0;
    let applicableThreshold = 0;

    // Find applicable surcharge rate
    for (const config of surchargeConfig) {
      if (taxableIncome > config.threshold) {
        surchargeRate = config.rate;
        applicableThreshold = config.threshold;
      }
    }

    if (surchargeRate === 0) {
      return { surcharge: 0, marginalRelief: 0 };
    }

    const surcharge = new Decimal(baseTax).mul(surchargeRate).div(100);
    
    // Calculate marginal relief
    const incomeExcess = taxableIncome - applicableThreshold;
    const marginalRelief = surcharge.greaterThan(incomeExcess) 
      ? surcharge.minus(incomeExcess) 
      : new Decimal(0);

    return {
      surcharge: surcharge.minus(marginalRelief).toNumber(),
      marginalRelief: marginalRelief.toNumber()
    };
  }

  private static calculateRebate87A(
    taxableIncome: number,
    slabTax: number,
    rebateConfig: { maxIncome: number; maxRebate: number }
  ): number {
    if (taxableIncome > rebateConfig.maxIncome) {
      return 0;
    }
    return Math.min(slabTax, rebateConfig.maxRebate);
  }

  public static calculate(input: TaxCalculationInput): TaxCalculationResult {
    const rules = this.getRules(input.assessmentYear);
    const appliedRules: string[] = [];

    // Normalize all input amounts
    const normalizedIncomes = {
      salary: this.normalizeAmount(input.incomes.salary),
      interest: this.normalizeAmount(input.incomes.interest),
      capitalGains: {
        shortTerm: this.normalizeAmount(input.incomes.capitalGains.shortTerm),
        longTerm: this.normalizeAmount(input.incomes.capitalGains.longTerm)
      },
      property: this.normalizeAmount(input.incomes.property),
      crypto: this.normalizeAmount(input.incomes.crypto),
      other: this.normalizeAmount(input.incomes.other),
      exempt: this.normalizeAmount(input.incomes.exempt)
    };

    const normalizedDeductions = {
      section80C: this.normalizeAmount(input.deductions.section80C),
      section80D: this.normalizeAmount(input.deductions.section80D),
      section80TTA: this.normalizeAmount(input.deductions.section80TTA),
      section80CCD: this.normalizeAmount(input.deductions.section80CCD),
      other: this.normalizeAmount(input.deductions.other)
    };

    // Step 1: Calculate Gross Income
    const grossIncome = 
      normalizedIncomes.salary +
      normalizedIncomes.interest +
      normalizedIncomes.capitalGains.shortTerm +
      normalizedIncomes.capitalGains.longTerm +
      normalizedIncomes.property +
      normalizedIncomes.crypto +
      normalizedIncomes.other;

    const exemptIncome = normalizedIncomes.exempt;
    const totalIncome = grossIncome - exemptIncome;

    // Step 2: Apply Standard Deduction
    const regimeConfig = input.regime === 'old' ? rules.oldRegime : rules.newRegime;
    const standardDeduction = regimeConfig.standardDeduction;
    appliedRules.push(`standard-deduction-${standardDeduction}`);

    // Step 3: Calculate Total Deductions
    let totalDeductions = 0;
    if (input.regime === 'old') {
      // Old regime allows all deductions
      totalDeductions = 
        Math.min(normalizedDeductions.section80C, 150000) + // 80C limit
        Math.min(normalizedDeductions.section80D, 25000) + // 80D limit (basic)
        Math.min(normalizedDeductions.section80TTA, 10000) + // 80TTA limit
        normalizedDeductions.section80CCD +
        normalizedDeductions.other;
      appliedRules.push('old-regime-deductions');
    } else {
      // New regime - no deductions except standard
      appliedRules.push('new-regime-no-deductions');
    }

    // Step 4: Calculate Taxable Income
    const taxableIncome = Math.max(0, totalIncome - standardDeduction - totalDeductions);

    // Step 5: Get applicable slabs
    let slabs: TaxSlab[];
    if (input.regime === 'old') {
      switch (input.ageGroup) {
        case 'senior':
          slabs = rules.oldRegime.slabs.senior;
          appliedRules.push('senior-citizen-slabs');
          break;
        case 'superSenior':
          slabs = rules.oldRegime.slabs.superSenior;
          appliedRules.push('super-senior-citizen-slabs');
          break;
        default:
          slabs = rules.oldRegime.slabs.general;
          appliedRules.push('general-slabs');
      }
    } else {
      slabs = rules.newRegime.slabs;
      appliedRules.push('new-regime-slabs');
    }

    // Step 6: Calculate Slab Tax
    const { tax: slabTax, breakdown: slabBreakdown } = this.calculateSlabTax(taxableIncome, slabs);

    // Step 7: Apply Rebate u/s 87A
    const rebate87A = this.calculateRebate87A(taxableIncome, slabTax, regimeConfig.rebate87A);
    if (rebate87A > 0) {
      appliedRules.push('rebate-87A');
    }

    const taxAfterRebate = Math.max(0, slabTax - rebate87A);

    // Step 8: Calculate Surcharge
    const { surcharge, marginalRelief } = this.calculateSurcharge(
      taxableIncome,
      taxAfterRebate,
      rules.surcharge
    );

    if (surcharge > 0) {
      appliedRules.push('surcharge-applied');
    }
    if (marginalRelief > 0) {
      appliedRules.push('marginal-relief');
    }

    const taxAfterSurcharge = taxAfterRebate + surcharge;

    // Step 9: Calculate Cess
    const cess = new Decimal(taxAfterSurcharge).mul(rules.cess.rate).div(100).toNumber();
    appliedRules.push('health-education-cess-4%');

    // Step 10: Total Tax Liability
    const totalTaxLiability = taxAfterSurcharge + cess;

    // Step 11: Calculate Tax Paid
    const totalTaxPaid = 
      this.normalizeAmount(input.tdsAndTcs.tds) +
      this.normalizeAmount(input.tdsAndTcs.tcs) +
      this.normalizeAmount(input.tdsAndTcs.advanceTax);

    // Step 12: Calculate Refund or Due
    const refundOrDue = totalTaxPaid - totalTaxLiability;

    return {
      assessmentYear: input.assessmentYear,
      regime: input.regime,
      ageGroup: input.ageGroup,
      breakdown: {
        grossIncome: Math.round(grossIncome),
        exemptIncome: Math.round(exemptIncome),
        totalIncome: Math.round(totalIncome),
        standardDeduction: Math.round(standardDeduction),
        totalDeductions: Math.round(totalDeductions),
        taxableIncome: Math.round(taxableIncome),
        slabTax: Math.round(slabTax),
        rebate87A: Math.round(rebate87A),
        taxAfterRebate: Math.round(taxAfterRebate),
        surcharge: Math.round(surcharge),
        marginalRelief: Math.round(marginalRelief),
        taxAfterSurcharge: Math.round(taxAfterSurcharge),
        cess: Math.round(cess),
        totalTaxLiability: Math.round(totalTaxLiability),
        totalTaxPaid: Math.round(totalTaxPaid),
        refundOrDue: Math.round(refundOrDue)
      },
      slabBreakdown,
      appliedRules
    };
  }

  public static compareRegimes(input: Omit<TaxCalculationInput, 'regime'>): {
    old: TaxCalculationResult;
    new: TaxCalculationResult;
    recommended: 'old' | 'new';
    savings: number;
  } {
    const oldResult = this.calculate({ ...input, regime: 'old' });
    const newResult = this.calculate({ ...input, regime: 'new' });

    const oldTax = oldResult.breakdown.totalTaxLiability;
    const newTax = newResult.breakdown.totalTaxLiability;

    const recommended = newTax <= oldTax ? 'new' : 'old';
    const savings = Math.abs(oldTax - newTax);

    return {
      old: oldResult,
      new: newResult,
      recommended,
      savings: Math.round(savings)
    };
  }
}
