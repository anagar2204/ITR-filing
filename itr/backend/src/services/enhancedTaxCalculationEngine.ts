import { TaxCalculationEngine, TaxCalculationResult } from './taxCalculationEngine';

export class EnhancedTaxCalculationEngine extends TaxCalculationEngine {
  
  /**
   * Enhanced tax calculation with improved accuracy
   */
  static calculateTaxEnhanced(
    incomeData: any,
    deductionData: any,
    taxesPaidData: any,
    regime: 'OLD' | 'NEW',
    financialYear: string
  ): TaxCalculationResult {
    
    // Step 1: Enhanced income calculation with proper exemptions
    const enhancedIncomeData = this.enhanceIncomeCalculation(incomeData);
    
    // Step 2: Enhanced deduction calculation with proper limits
    const enhancedDeductionData = this.enhanceDeductionCalculation(deductionData, regime, financialYear);
    
    // Step 3: Enhanced tax calculation with precise mathematical formulas
    const result = this.calculateTaxWithEnhancedAccuracy(
      enhancedIncomeData,
      enhancedDeductionData,
      taxesPaidData,
      regime,
      financialYear
    );
    
    return result;
  }

  /**
   * Enhanced income calculation with proper exemptions
   */
  private static enhanceIncomeCalculation(incomeData: any) {
    const salary = incomeData.salary || {};
    
    // Calculate HRA exemption more accurately
    const hraExemption = this.calculateHRAExemption(
      salary.hra || 0,
      salary.basicSalary || 0,
      salary.rentPaid || 0,
      salary.cityType || 'metro'
    );
    
    // Calculate LTA exemption
    const ltaExemption = Math.min(salary.lta || 0, 25000); // Simplified LTA exemption
    
    // Calculate other allowance exemptions
    const otherExemptions = this.calculateOtherExemptions(salary);
    
    // Enhanced salary income calculation
    const enhancedSalary = {
      ...salary,
      netSalaryIncome: (salary.basicSalary || 0) + 
                      (salary.hra || 0) - hraExemption +
                      (salary.specialAllowance || 0) +
                      (salary.otherAllowances || 0) +
                      (salary.lta || 0) - ltaExemption -
                      otherExemptions,
      hraExemption,
      ltaExemption,
      otherExemptions
    };
    
    return {
      ...incomeData,
      salary: enhancedSalary
    };
  }

  /**
   * Calculate HRA exemption with enhanced accuracy
   */
  private static calculateHRAExemption(
    hraReceived: number,
    basicSalary: number,
    rentPaid: number,
    cityType: string
  ): number {
    if (hraReceived === 0 || rentPaid === 0) return 0;
    
    // HRA exemption is minimum of:
    // 1. Actual HRA received
    // 2. 50% of basic salary (metro) or 40% (non-metro)
    // 3. Rent paid minus 10% of basic salary
    
    const cityPercentage = cityType === 'metro' ? 0.5 : 0.4;
    const salaryBasedExemption = basicSalary * cityPercentage;
    const rentBasedExemption = Math.max(0, rentPaid - (basicSalary * 0.1));
    
    return Math.min(hraReceived, salaryBasedExemption, rentBasedExemption);
  }

  /**
   * Calculate other exemptions
   */
  private static calculateOtherExemptions(salary: any): number {
    let exemptions = 0;
    
    // Professional tax exemption (fully exempt)
    exemptions += salary.professionalTax || 0;
    
    // Entertainment allowance (for government employees - simplified)
    exemptions += Math.min(salary.entertainmentAllowance || 0, 5000);
    
    return exemptions;
  }

  /**
   * Enhanced deduction calculation with proper limits and validations
   */
  private static enhanceDeductionCalculation(deductionData: any, regime: 'OLD' | 'NEW', financialYear: string) {
    if (regime === 'NEW') {
      // New regime has limited deductions
      return {
        section80C: { total: 0 },
        section80D: { total: 0 },
        otherDeductions: { total: 0 },
        standardDeduction: financialYear === '2024-25' ? 75000 : 50000,
        totalDeductions: financialYear === '2024-25' ? 75000 : 50000
      };
    }

    // Enhanced Section 80C calculation
    const section80C = this.calculateEnhancedSection80C(deductionData.section80C || {});
    
    // Enhanced Section 80D calculation
    const section80D = this.calculateEnhancedSection80D(deductionData.section80D || {});
    
    // Enhanced other deductions calculation
    const otherDeductions = this.calculateEnhancedOtherDeductions(deductionData.otherDeductions || {});
    
    // Standard deduction for old regime
    const standardDeduction = financialYear === '2024-25' ? 75000 : 50000;
    
    const totalDeductions = section80C.total + section80D.total + otherDeductions.total + standardDeduction;
    
    return {
      section80C,
      section80D,
      otherDeductions,
      standardDeduction,
      totalDeductions
    };
  }

  /**
   * Enhanced Section 80C calculation with proper limits
   */
  private static calculateEnhancedSection80C(section80CData: any) {
    const components = {
      lifeInsurancePremium: Math.min(section80CData.lifeInsurancePremium || 0, 150000),
      epfContribution: Math.min(section80CData.epfContribution || 0, 150000),
      ppfContribution: Math.min(section80CData.ppfContribution || 0, 150000),
      elssInvestment: Math.min(section80CData.elssInvestment || 0, 150000),
      nscInvestment: Math.min(section80CData.nscInvestment || 0, 150000),
      sukanyaSamriddhiYojana: Math.min(section80CData.sukanyaSamriddhiYojana || 0, 150000),
      homeLoanPrincipal: Math.min(section80CData.homeLoanPrincipal || 0, 150000),
      tuitionFees: Math.min(section80CData.tuitionFees || 0, 150000)
    };
    
    const subtotal = Object.values(components).reduce((sum, val) => sum + val, 0);
    const total = Math.min(subtotal, 150000); // Overall 80C limit
    
    return {
      ...components,
      subtotal,
      total,
      limit: 150000,
      utilized: total,
      remaining: Math.max(0, 150000 - total)
    };
  }

  /**
   * Enhanced Section 80D calculation with age-based limits
   */
  private static calculateEnhancedSection80D(section80DData: any) {
    const selfFamilyPremium = section80DData.selfFamilyPremium || 0;
    const parentsPremium = section80DData.parentsPremium || 0;
    const selfFamilyCheckup = section80DData.selfFamilyPreventiveCheckup || 0;
    const parentsCheckup = section80DData.parentsPreventiveCheckup || 0;
    
    // Self and family limit (25,000 for below 60, 50,000 for above 60)
    const selfFamilyLimit = 25000; // Simplified - can be enhanced based on age
    const selfFamilyTotal = Math.min(selfFamilyPremium + selfFamilyCheckup, selfFamilyLimit);
    
    // Parents limit (25,000 for below 60, 50,000 for above 60)
    const parentsLimit = 50000; // Assuming senior citizen parents
    const parentsTotal = Math.min(parentsPremium + parentsCheckup, parentsLimit);
    
    const total = selfFamilyTotal + parentsTotal;
    
    return {
      selfFamilyPremium,
      parentsPremium,
      selfFamilyCheckup,
      parentsCheckup,
      selfFamilyTotal,
      parentsTotal,
      total,
      maxPossible: selfFamilyLimit + parentsLimit
    };
  }

  /**
   * Enhanced other deductions calculation
   */
  private static calculateEnhancedOtherDeductions(otherDeductionsData: any) {
    const components = {
      section80E: otherDeductionsData.section80E || 0, // No limit for education loan
      section80G: Math.min(otherDeductionsData.section80G || 0, 200000), // Simplified limit
      section80TTA: Math.min(otherDeductionsData.section80TTA || 0, 10000),
      section80TTB: Math.min(otherDeductionsData.section80TTB || 0, 50000),
      section80GG: Math.min(otherDeductionsData.section80GG || 0, 60000),
      section24B: Math.min(otherDeductionsData.section24B || 0, 200000), // Home loan interest
      section80DD: Math.min(otherDeductionsData.section80DD || 0, 125000),
      section80DDB: Math.min(otherDeductionsData.section80DDB || 0, 100000),
      section80U: Math.min(otherDeductionsData.section80U || 0, 125000)
    };
    
    const total = Object.values(components).reduce((sum, val) => sum + val, 0);
    
    return {
      ...components,
      total
    };
  }

  /**
   * Enhanced tax calculation with precise mathematical formulas
   */
  private static calculateTaxWithEnhancedAccuracy(
    incomeData: any,
    deductionData: any,
    taxesPaidData: any,
    regime: 'OLD' | 'NEW',
    financialYear: string
  ): TaxCalculationResult {
    
    const config = this.FY_CONFIGS[financialYear];
    if (!config) {
      throw new Error(`Invalid financial year: ${financialYear}`);
    }
    
    const regimeConfig = regime === 'OLD' ? config.oldRegime : config.newRegime;

    // Calculate enhanced gross total income
    const grossTotalIncome = this.calculateEnhancedGrossTotalIncome(incomeData);
    
    // Calculate enhanced taxable income
    const taxableIncome = Math.max(0, grossTotalIncome - deductionData.totalDeductions);
    
    // Calculate tax using enhanced slab calculation
    const taxBeforeRebate = this.calculateEnhancedTaxOnSlabs(taxableIncome, regimeConfig.slabs);
    
    // Calculate rebate with enhanced logic
    const rebateU87A = this.calculateEnhancedRebate87A(taxableIncome, taxBeforeRebate, regime);
    
    // Tax after rebate
    const taxAfterRebate = Math.max(0, taxBeforeRebate - rebateU87A);
    
    // Calculate surcharge with enhanced logic
    const surcharge = this.calculateEnhancedSurcharge(grossTotalIncome, taxAfterRebate, regime);
    
    // Calculate health and education cess
    const healthEducationCess = Math.round((taxAfterRebate + surcharge) * 0.04);
    
    // Total tax liability
    const totalTaxLiability = taxAfterRebate + surcharge + healthEducationCess;
    
    // Calculate taxes paid
    const totalTaxesPaid = (taxesPaidData.salaryTDS || 0) + 
                          (taxesPaidData.otherTDS || 0) + 
                          (taxesPaidData.advanceTax || 0) + 
                          (taxesPaidData.selfAssessmentTax || 0);
    
    // Calculate refund or additional tax due
    const refundDue = Math.max(0, totalTaxesPaid - totalTaxLiability);
    const additionalTaxDue = Math.max(0, totalTaxLiability - totalTaxesPaid);
    
    // Calculate rates
    const effectiveTaxRate = grossTotalIncome > 0 ? (totalTaxLiability / grossTotalIncome) * 100 : 0;
    const marginalTaxRate = this.calculateMarginalTaxRate(taxableIncome, regimeConfig.slabs);

    return {
      grossTotalIncome: Math.round(grossTotalIncome),
      totalDeductions: Math.round(deductionData.totalDeductions),
      taxableIncome: Math.round(taxableIncome),
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebateU87A: Math.round(rebateU87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      healthEducationCess: Math.round(healthEducationCess),
      totalTaxLiability: Math.round(totalTaxLiability),
      refundDue: Math.round(refundDue),
      additionalTaxDue: Math.round(additionalTaxDue),
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      marginalTaxRate: Math.round(marginalTaxRate * 100) / 100,
      advanceTaxPaid: Math.round(taxesPaidData.advanceTax || 0),
      tdsDeducted: Math.round((taxesPaidData.salaryTDS || 0) + (taxesPaidData.otherTDS || 0)),
      selfAssessmentTax: Math.round(taxesPaidData.selfAssessmentTax || 0),
      regime,
      financialYear
    };
  }

  /**
   * Calculate enhanced gross total income
   */
  private static calculateEnhancedGrossTotalIncome(incomeData: any): number {
    let grossIncome = 0;
    
    // Salary income (net after exemptions)
    if (incomeData.salary) {
      grossIncome += incomeData.salary.netSalaryIncome || 0;
    }
    
    // House property income
    if (incomeData.houseProperty && Array.isArray(incomeData.houseProperty)) {
      grossIncome += incomeData.houseProperty.reduce((sum: number, property: any) => {
        const rental = property.rentalIncome || 0;
        const municipal = property.municipalTax || 0;
        const interest = property.interestOnLoan || 0;
        const other = property.otherExpenses || 0;
        return sum + Math.max(0, rental - municipal - interest - other);
      }, 0);
    }
    
    // Capital gains
    if (incomeData.capitalGains) {
      grossIncome += (incomeData.capitalGains.shortTermGains || 0) + 
                    (incomeData.capitalGains.longTermGains || 0);
    }
    
    // Other sources
    if (incomeData.otherSources) {
      grossIncome += (incomeData.otherSources.interestIncome || 0) + 
                    (incomeData.otherSources.dividendIncome || 0) + 
                    (incomeData.otherSources.otherIncome || 0);
    }
    
    // Business income
    if (incomeData.business) {
      grossIncome += incomeData.business.netProfit || 0;
    }
    
    return grossIncome;
  }

  /**
   * Enhanced tax calculation on slabs with precise rounding
   */
  private static calculateEnhancedTaxOnSlabs(taxableIncome: number, slabs: any[]): number {
    let tax = 0;
    let remainingIncome = taxableIncome;
    
    for (const slab of slabs) {
      if (remainingIncome <= 0) break;
      
      const slabMin = slab.min;
      const slabMax = slab.max === Infinity ? Infinity : slab.max;
      const slabRate = slab.rate / 100;
      
      if (taxableIncome > slabMin) {
        const taxableInThisSlab = Math.min(remainingIncome, slabMax - slabMin);
        const taxInThisSlab = taxableInThisSlab * slabRate;
        tax += taxInThisSlab;
        remainingIncome -= taxableInThisSlab;
      }
    }
    
    return tax;
  }

  /**
   * Enhanced rebate calculation
   */
  private static calculateEnhancedRebate87A(taxableIncome: number, tax: number, regime: 'OLD' | 'NEW'): number {
    if (regime === 'OLD') {
      // Old regime: Rebate for income up to Rs. 5 lakh
      if (taxableIncome <= 500000) {
        return Math.min(tax, 12500);
      }
    } else {
      // New regime: Rebate for income up to Rs. 7 lakh
      if (taxableIncome <= 700000) {
        return Math.min(tax, 25000);
      }
    }
    return 0;
  }

  /**
   * Enhanced surcharge calculation
   */
  private static calculateEnhancedSurcharge(grossIncome: number, tax: number, regime: 'OLD' | 'NEW'): number {
    if (grossIncome <= 5000000) return 0; // No surcharge below 50 lakh
    
    let surchargeRate = 0;
    
    if (grossIncome <= 10000000) {
      surchargeRate = 0.10; // 10% surcharge between 50L-1Cr
    } else if (grossIncome <= 20000000) {
      surchargeRate = 0.15; // 15% surcharge between 1Cr-2Cr
    } else if (grossIncome <= 50000000) {
      surchargeRate = 0.25; // 25% surcharge between 2Cr-5Cr
    } else {
      surchargeRate = 0.37; // 37% surcharge above 5Cr
    }
    
    return tax * surchargeRate;
  }

  /**
   * Calculate marginal tax rate
   */
  private static calculateMarginalTaxRate(taxableIncome: number, slabs: any[]): number {
    for (let i = slabs.length - 1; i >= 0; i--) {
      if (taxableIncome > slabs[i].min) {
        return slabs[i].rate;
      }
    }
    return 0;
  }
}
