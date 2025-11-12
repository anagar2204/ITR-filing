import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Tax Configuration Interface
interface TaxConfig {
  financialYear: string;
  assessmentYear: string;
  version: string;
  releaseDate: string;
  sourceUrl: string;
  regimes: {
    new: RegimeConfig;
    old: RegimeConfig;
  };
  surcharge: SurchargeConfig;
  cess: CessConfig;
  specialRates: SpecialRatesConfig;
}

interface RegimeConfig {
  name: string;
  standardDeduction: number;
  slabs?: Slab[];
  ageGroups?: Record<string, { slabs: Slab[] }>;
  rebate87A: Rebate87AConfig;
  allowedDeductions: string[];
}

interface Slab {
  from: number;
  to: number | null;
  rate: number;
}

interface Rebate87AConfig {
  enabled: boolean;
  maxIncome: number;
  maxRebate: number;
  description: string;
}

interface SurchargeConfig {
  slabs: Slab[];
  marginalRelief: {
    enabled: boolean;
    description: string;
  };
}

interface CessConfig {
  rate: number;
  description: string;
}

interface SpecialRatesConfig {
  ltcg: {
    rate: number;
    exemptionLimit: number;
    description: string;
  };
  stcg: {
    equity: number;
    other: string;
    description: string;
  };
}

// Input Interface
export interface TaxCalculationInput {
  financialYear: 'FY2024-25' | 'FY2025-26';
  regime: 'new' | 'old';
  ageGroup?: '0-60' | '60-80' | '80+';
  incomes: {
    salary: number;
    interest: number;
    rental: number;
    businessProfession: number;
    capitalGains: number;
    otherSources: number;
    ltcg?: number;
    stcg?: number;
  };
  deductions?: Record<string, number>;
  exemptions?: number;
  tdsPaid?: number;
  tcsPaid?: number;
  advanceTax?: number;
}

// Output Interface
export interface TaxCalculationResult {
  financialYear: string;
  assessmentYear: string;
  regime: 'new' | 'old';
  ageGroup: string;
  configVersion: string;
  configHash: string;
  timestamp: string;
  
  breakdown: {
    grossIncome: number;
    standardDeduction: number;
    totalDeductions: number;
    exemptions: number;
    taxableIncome: number;
    
    slabTaxBeforeSurcharge: number;
    rebate87A: number;
    taxAfterRebate: number;
    
    surcharge: number;
    marginalRelief: number;
    taxAfterSurcharge: number;
    
    healthEducationCess: number;
    totalTaxLiability: number;
    
    tdsPaid: number;
    tcsPaid: number;
    advanceTax: number;
    totalTaxPaid: number;
    
    refundOrDue: number;
  };
  
  detailedSlabComputation: Array<{
    slabFrom: number;
    slabTo: number | null;
    rate: number;
    taxableAmount: number;
    tax: number;
  }>;
  
  appliedRules: string[];
  
  comparisonWithOtherRegime?: {
    regime: string;
    totalTaxLiability: number;
    savings: number;
    recommended: boolean;
  };
}

// Tax Engine Class
export class TaxEngine {
  private configs: Map<string, TaxConfig> = new Map();
  
  constructor() {
    this.loadConfigs();
  }
  
  private loadConfigs(): void {
    const configDir = path.join(__dirname, '../config/tax');
    const files = ['fy-2024-25.json', 'fy-2025-26.json'];
    
    files.forEach(file => {
      const filePath = path.join(configDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const config: TaxConfig = JSON.parse(content);
      this.configs.set(config.financialYear, config);
    });
  }
  
  private getConfig(financialYear: string): TaxConfig {
    const config = this.configs.get(financialYear);
    if (!config) {
      throw new Error(`Tax configuration not found for ${financialYear}`);
    }
    return config;
  }
  
  private getConfigHash(config: TaxConfig): string {
    return crypto.createHash('sha256')
      .update(JSON.stringify(config))
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Calculate slab-based tax
   */
  private calculateSlabTax(taxableIncome: number, slabs: Slab[]): {
    tax: number;
    details: Array<{ slabFrom: number; slabTo: number | null; rate: number; taxableAmount: number; tax: number }>;
  } {
    let remaining = taxableIncome;
    let totalTax = 0;
    const details: Array<any> = [];
    
    for (const slab of slabs) {
      if (remaining <= 0) break;
      
      const slabStart = slab.from;
      const slabEnd = slab.to ?? Infinity;
      
      if (taxableIncome <= slabStart) continue;
      
      const taxableInThisSlab = Math.min(
        Math.max(0, taxableIncome - slabStart),
        slabEnd - slabStart
      );
      
      const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100;
      totalTax += taxInThisSlab;
      
      if (taxableInThisSlab > 0) {
        details.push({
          slabFrom: slabStart,
          slabTo: slab.to,
          rate: slab.rate,
          taxableAmount: taxableInThisSlab,
          tax: Math.round(taxInThisSlab)
        });
      }
    }
    
    return {
      tax: Math.round(totalTax),
      details
    };
  }
  
  /**
   * Calculate surcharge with marginal relief
   */
  private calculateSurcharge(
    taxableIncome: number,
    baseTax: number,
    surchargeConfig: SurchargeConfig
  ): { surcharge: number; marginalRelief: number } {
    // Find applicable surcharge rate
    let surchargeRate = 0;
    let thresholdIncome = 0;
    
    for (const slab of surchargeConfig.slabs) {
      if (taxableIncome > slab.from) {
        surchargeRate = slab.rate;
        thresholdIncome = slab.from;
      }
    }
    
    if (surchargeRate === 0) {
      return { surcharge: 0, marginalRelief: 0 };
    }
    
    const surcharge = Math.round((baseTax * surchargeRate) / 100);
    
    // Calculate marginal relief if enabled
    let marginalRelief = 0;
    if (surchargeConfig.marginalRelief.enabled && thresholdIncome > 0) {
      // Tax at threshold
      const incomeExcess = taxableIncome - thresholdIncome;
      const maxAdditionalTax = incomeExcess;
      
      // If surcharge causes tax to exceed income excess, apply marginal relief
      if (surcharge > maxAdditionalTax) {
        marginalRelief = surcharge - maxAdditionalTax;
      }
    }
    
    return {
      surcharge: surcharge - marginalRelief,
      marginalRelief
    };
  }
  
  /**
   * Calculate Section 87A rebate
   */
  private calculateRebate87A(
    taxableIncome: number,
    baseTax: number,
    rebateConfig: Rebate87AConfig
  ): number {
    if (!rebateConfig.enabled) return 0;
    if (taxableIncome > rebateConfig.maxIncome) return 0;
    
    // Rebate is minimum of tax or max rebate amount
    return Math.min(baseTax, rebateConfig.maxRebate);
  }
  
  /**
   * Main calculation method
   */
  public calculate(input: TaxCalculationInput): TaxCalculationResult {
    const config = this.getConfig(input.financialYear);
    const regimeConfig = config.regimes[input.regime];
    const appliedRules: string[] = [];
    
    // Step 1: Calculate Gross Income
    const grossIncome = 
      input.incomes.salary +
      input.incomes.interest +
      input.incomes.rental +
      input.incomes.businessProfession +
      input.incomes.capitalGains +
      input.incomes.otherSources;
    
    // Step 2: Apply Standard Deduction
    const standardDeduction = regimeConfig.standardDeduction;
    appliedRules.push(`standard-deduction-${standardDeduction}`);
    
    // Step 3: Apply Chapter VI-A Deductions
    let totalDeductions = 0;
    if (input.deductions) {
      for (const [section, amount] of Object.entries(input.deductions)) {
        if (regimeConfig.allowedDeductions.includes(section)) {
          totalDeductions += amount;
          appliedRules.push(`deduction-${section}`);
        }
      }
    }
    
    // Step 4: Apply Exemptions
    const exemptions = input.exemptions || 0;
    
    // Step 5: Calculate Taxable Income
    const taxableIncome = Math.max(
      0,
      grossIncome - standardDeduction - totalDeductions - exemptions
    );
    
    // Step 6: Get applicable slabs
    let slabs: Slab[];
    const ageGroup = input.ageGroup || '0-60';
    
    if (input.regime === 'old' && regimeConfig.ageGroups) {
      slabs = regimeConfig.ageGroups[ageGroup].slabs;
      appliedRules.push(`age-group-${ageGroup}`);
    } else {
      slabs = regimeConfig.slabs!;
    }
    
    // Step 7: Calculate Slab Tax
    const { tax: slabTax, details: slabDetails } = this.calculateSlabTax(taxableIncome, slabs);
    
    // Step 8: Apply Section 87A Rebate
    const rebate87A = this.calculateRebate87A(
      taxableIncome,
      slabTax,
      regimeConfig.rebate87A
    );
    
    if (rebate87A > 0) {
      appliedRules.push('87A-rebate');
    }
    
    const taxAfterRebate = Math.max(0, slabTax - rebate87A);
    
    // Step 9: Calculate Surcharge
    const { surcharge, marginalRelief } = this.calculateSurcharge(
      taxableIncome,
      taxAfterRebate,
      config.surcharge
    );
    
    if (surcharge > 0) {
      appliedRules.push('surcharge-applied');
    }
    if (marginalRelief > 0) {
      appliedRules.push('marginal-relief-applied');
    }
    
    const taxAfterSurcharge = taxAfterRebate + surcharge;
    
    // Step 10: Calculate Health & Education Cess
    const cess = Math.round((taxAfterSurcharge * config.cess.rate) / 100);
    appliedRules.push('health-education-cess-4%');
    
    // Step 11: Total Tax Liability
    const totalTaxLiability = taxAfterSurcharge + cess;
    
    // Step 12: Calculate Tax Paid
    const tdsPaid = input.tdsPaid || 0;
    const tcsPaid = input.tcsPaid || 0;
    const advanceTax = input.advanceTax || 0;
    const totalTaxPaid = tdsPaid + tcsPaid + advanceTax;
    
    // Step 13: Calculate Refund or Due
    const refundOrDue = totalTaxPaid - totalTaxLiability;
    
    // Build result
    const result: TaxCalculationResult = {
      financialYear: config.financialYear,
      assessmentYear: config.assessmentYear,
      regime: input.regime,
      ageGroup,
      configVersion: config.version,
      configHash: this.getConfigHash(config),
      timestamp: new Date().toISOString(),
      
      breakdown: {
        grossIncome,
        standardDeduction,
        totalDeductions,
        exemptions,
        taxableIncome,
        
        slabTaxBeforeSurcharge: slabTax,
        rebate87A,
        taxAfterRebate,
        
        surcharge,
        marginalRelief,
        taxAfterSurcharge,
        
        healthEducationCess: cess,
        totalTaxLiability,
        
        tdsPaid,
        tcsPaid,
        advanceTax,
        totalTaxPaid,
        
        refundOrDue
      },
      
      detailedSlabComputation: slabDetails,
      appliedRules
    };
    
    return result;
  }
  
  /**
   * Compare both regimes
   */
  public compareRegimes(input: TaxCalculationInput): {
    new: TaxCalculationResult;
    old: TaxCalculationResult;
    recommended: 'new' | 'old';
    savings: number;
  } {
    const newRegimeResult = this.calculate({ ...input, regime: 'new' });
    const oldRegimeResult = this.calculate({ ...input, regime: 'old' });
    
    const newTax = newRegimeResult.breakdown.totalTaxLiability;
    const oldTax = oldRegimeResult.breakdown.totalTaxLiability;
    
    const recommended = newTax <= oldTax ? 'new' : 'old';
    const savings = Math.abs(newTax - oldTax);
    
    // Add comparison to results
    newRegimeResult.comparisonWithOtherRegime = {
      regime: 'old',
      totalTaxLiability: oldTax,
      savings: oldTax - newTax,
      recommended: recommended === 'new'
    };
    
    oldRegimeResult.comparisonWithOtherRegime = {
      regime: 'new',
      totalTaxLiability: newTax,
      savings: newTax - oldTax,
      recommended: recommended === 'old'
    };
    
    return {
      new: newRegimeResult,
      old: oldRegimeResult,
      recommended,
      savings
    };
  }
}

// Export singleton instance
export const taxEngine = new TaxEngine();
