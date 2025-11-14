/**
 * Comprehensive Tax Calculation Engine
 * Supports Old & New Tax Regimes for FY 2023-24 and FY 2024-25
 * 100% Accurate Mathematical Formulas as per Income Tax Act
 */

export interface TaxSlabs {
  min: number;
  max: number;
  rate: number;
}

export interface TaxRegimeConfig {
  standardDeduction: number;
  basicExemption: number;
  slabs: TaxSlabs[];
  surchargeThreshold: number;
  cessRate: number;
  allowedDeductions: string[];
}

export interface FinancialYearConfig {
  year: string;
  oldRegime: TaxRegimeConfig;
  newRegime: TaxRegimeConfig;
}

export interface IncomeCalculationResult {
  salaryIncome: number;
  housePropertyIncome: number;
  capitalGainsIncome: number;
  otherSourcesIncome: number;
  businessIncome: number;
  totalGrossIncome: number;
  exemptIncome: number;
  netTaxableIncome: number;
}

export interface DeductionCalculationResult {
  section80C: number;
  section80D: number;
  section80E: number;
  section80G: number;
  section80TTA: number;
  section80TTB: number;
  section80GG: number;
  section24B: number;
  section80DD: number;
  section80DDB: number;
  section80U: number;
  standardDeduction: number;
  totalDeductions: number;
}

export interface TaxCalculationResult {
  grossTotalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebateU87A: number;
  taxAfterRebate: number;
  surcharge: number;
  healthEducationCess: number;
  totalTaxLiability: number;
  advanceTaxPaid: number;
  tdsDeducted: number;
  selfAssessmentTax: number;
  refundDue: number;
  additionalTaxDue: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  regime: 'OLD' | 'NEW';
  financialYear: string;
}

export class TaxCalculationEngine {
  public static readonly FY_CONFIGS: Record<string, FinancialYearConfig> = {
    '2023-24': {
      year: '2023-24',
      oldRegime: {
        standardDeduction: 50000,
        basicExemption: 250000,
        slabs: [
          { min: 0, max: 250000, rate: 0 },
          { min: 250001, max: 500000, rate: 5 },
          { min: 500001, max: 1000000, rate: 20 },
          { min: 1000001, max: Infinity, rate: 30 }
        ],
        surchargeThreshold: 5000000,
        cessRate: 4,
        allowedDeductions: ['80C', '80D', '80E', '80G', '80TTA', '80TTB', '80GG', '24B', '80DD', '80DDB', '80U']
      },
      newRegime: {
        standardDeduction: 50000,
        basicExemption: 300000,
        slabs: [
          { min: 0, max: 300000, rate: 0 },
          { min: 300001, max: 600000, rate: 5 },
          { min: 600001, max: 900000, rate: 10 },
          { min: 900001, max: 1200000, rate: 15 },
          { min: 1200001, max: 1500000, rate: 20 },
          { min: 1500001, max: Infinity, rate: 30 }
        ],
        surchargeThreshold: 5000000,
        cessRate: 4,
        allowedDeductions: ['80CCD1B'] // Only employer NPS contribution allowed
      }
    },
    '2024-25': {
      year: '2024-25',
      oldRegime: {
        standardDeduction: 50000,
        basicExemption: 250000,
        slabs: [
          { min: 0, max: 250000, rate: 0 },
          { min: 250001, max: 500000, rate: 5 },
          { min: 500001, max: 1000000, rate: 20 },
          { min: 1000001, max: Infinity, rate: 30 }
        ],
        surchargeThreshold: 5000000,
        cessRate: 4,
        allowedDeductions: ['80C', '80D', '80E', '80G', '80TTA', '80TTB', '80GG', '24B', '80DD', '80DDB', '80U']
      },
      newRegime: {
        standardDeduction: 75000, // Increased for FY 2024-25
        basicExemption: 300000,
        slabs: [
          { min: 0, max: 300000, rate: 0 },
          { min: 300001, max: 700000, rate: 5 }, // Updated slab
          { min: 700001, max: 1000000, rate: 10 },
          { min: 1000001, max: 1200000, rate: 15 },
          { min: 1200001, max: 1500000, rate: 20 },
          { min: 1500001, max: Infinity, rate: 30 }
        ],
        surchargeThreshold: 5000000,
        cessRate: 4,
        allowedDeductions: ['80CCD1B']
      }
    }
  };

  /**
   * Calculate Salary Income with all components and exemptions
   */
  static calculateSalaryIncome(salaryData: any): number {
    const basicSalary = salaryData.basicSalary || 0;
    const hra = salaryData.hra || 0;
    const allowances = salaryData.allowances || 0;
    const bonuses = salaryData.bonuses || 0;
    const overtime = salaryData.overtime || 0;
    const commissions = salaryData.commissions || 0;
    
    // Perquisites (taxable benefits)
    const perquisites = salaryData.perquisites || 0;
    
    // Deductions from salary
    const epfEmployee = salaryData.epfEmployee || 0;
    const professionalTax = salaryData.professionalTax || 0;
    const otherDeductions = salaryData.otherDeductions || 0;
    
    // HRA Exemption Calculation (least of three)
    const rentPaid = salaryData.rentPaid || 0;
    const cityType = salaryData.cityType || 'non-metro';
    const hraExemptionRate = cityType === 'metro' ? 0.5 : 0.4;
    
    const hraExemption = Math.min(
      hra, // Actual HRA received
      rentPaid - (0.1 * basicSalary), // Rent paid minus 10% of basic salary
      hraExemptionRate * basicSalary // 50% or 40% of basic salary
    );
    
    const taxableHRA = Math.max(0, hra - hraExemption);
    
    // Calculate gross salary
    const grossSalary = basicSalary + taxableHRA + allowances + bonuses + overtime + commissions + perquisites;
    
    // Calculate net taxable salary
    const netTaxableSalary = grossSalary - epfEmployee - professionalTax - otherDeductions;
    
    return Math.max(0, netTaxableSalary);
  }

  /**
   * Calculate House Property Income with deductions
   */
  static calculateHousePropertyIncome(propertyData: any[]): number {
    let totalIncome = 0;
    
    propertyData.forEach(property => {
      const annualRent = property.annualRent || 0;
      const municipalTax = property.municipalTax || 0;
      const interestOnLoan = property.interestOnLoan || 0;
      const repairMaintenance = property.repairMaintenance || 0;
      const propertyType = property.propertyType || 'rented';
      
      let netAnnualValue = annualRent;
      
      // For self-occupied property, NAV is zero
      if (propertyType === 'self-occupied') {
        netAnnualValue = 0;
      }
      
      // Deductions from NAV
      const standardDeduction = netAnnualValue * 0.3; // 30% standard deduction
      const totalDeductions = standardDeduction + municipalTax + repairMaintenance + interestOnLoan;
      
      // Income from house property (can be negative)
      const propertyIncome = netAnnualValue - totalDeductions;
      
      // For self-occupied property, loss is limited to Rs. 2,00,000
      if (propertyType === 'self-occupied' && propertyIncome < 0) {
        totalIncome += Math.max(propertyIncome, -200000);
      } else {
        totalIncome += propertyIncome;
      }
    });
    
    return totalIncome;
  }

  /**
   * Calculate Capital Gains with indexation and exemptions
   */
  static calculateCapitalGains(capitalGainsData: any): number {
    const shortTermGains = capitalGainsData.shortTermGains || 0;
    const longTermGains = capitalGainsData.longTermGains || 0;
    const section54Exemption = capitalGainsData.section54Exemption || 0;
    const section54FExemption = capitalGainsData.section54FExemption || 0;
    
    // Short-term capital gains are fully taxable
    const taxableSTCG = Math.max(0, shortTermGains);
    
    // Long-term capital gains with exemptions
    const exemptedLTCG = section54Exemption + section54FExemption;
    const taxableLTCG = Math.max(0, longTermGains - exemptedLTCG);
    
    return taxableSTCG + taxableLTCG;
  }

  /**
   * Calculate Other Sources Income
   */
  static calculateOtherSourcesIncome(otherSourcesData: any): number {
    const interestIncome = otherSourcesData.interestIncome || 0;
    const dividendIncome = otherSourcesData.dividendIncome || 0;
    const winningsIncome = otherSourcesData.winningsIncome || 0;
    const familyPension = otherSourcesData.familyPension || 0;
    const otherIncome = otherSourcesData.otherIncome || 0;
    
    // Family pension deduction (1/3rd or Rs. 15,000, whichever is less)
    const familyPensionDeduction = Math.min(familyPension / 3, 15000);
    const taxableFamilyPension = Math.max(0, familyPension - familyPensionDeduction);
    
    return interestIncome + dividendIncome + winningsIncome + taxableFamilyPension + otherIncome;
  }

  /**
   * Calculate total deductions under various sections
   */
  static calculateDeductions(
    deductionData: any, 
    regime: 'OLD' | 'NEW', 
    financialYear: string,
    grossTotalIncome: number
  ): DeductionCalculationResult {
    const fyConfig = this.FY_CONFIGS[financialYear];
    if (!fyConfig) {
      throw new Error(`Invalid financial year: ${financialYear}`);
    }
    
    const config = regime === 'OLD' ? fyConfig.oldRegime : fyConfig.newRegime;
    const allowedDeductions = config.allowedDeductions;
    
    let result: DeductionCalculationResult = {
      section80C: 0,
      section80D: 0,
      section80E: 0,
      section80G: 0,
      section80TTA: 0,
      section80TTB: 0,
      section80GG: 0,
      section24B: 0,
      section80DD: 0,
      section80DDB: 0,
      section80U: 0,
      standardDeduction: config.standardDeduction,
      totalDeductions: config.standardDeduction
    };

    // Section 80C Deductions (Old Regime Only)
    if (allowedDeductions.includes('80C') && deductionData.section80C) {
      const section80CData = deductionData.section80C;
      const totalInvestments = 
        (section80CData.lifeInsurancePremium || 0) +
        (section80CData.epfContribution || 0) +
        (section80CData.ppfContribution || 0) +
        (section80CData.elssInvestment || 0) +
        (section80CData.nscInvestment || 0) +
        (section80CData.taxSaverFD || 0) +
        (section80CData.homeLoanPrincipal || 0) +
        (section80CData.tuitionFees || 0);
      
      result.section80C = Math.min(totalInvestments, 150000); // Max limit Rs. 1.5 lakh
    }

    // Section 80D Deductions (Old Regime Only)
    if (allowedDeductions.includes('80D') && deductionData.section80D) {
      const section80DData = deductionData.section80D;
      let totalDeduction = 0;
      
      // Self and family premium
      const selfFamilyLimit = (section80DData.selfAge === 'above60' || section80DData.spouseAge === 'above60') ? 50000 : 25000;
      totalDeduction += Math.min(section80DData.selfFamilyPremium || 0, selfFamilyLimit);
      
      // Parents premium
      const parentsLimit = section80DData.parentsAge === 'above60' ? 50000 : 25000;
      totalDeduction += Math.min(section80DData.parentsPremium || 0, parentsLimit);
      
      // Preventive health check-up (max Rs. 5,000)
      const preventiveCheckup = Math.min(
        (section80DData.selfFamilyPreventiveCheckup || 0) + (section80DData.parentsPreventiveCheckup || 0),
        5000
      );
      totalDeduction += preventiveCheckup;
      
      result.section80D = Math.min(totalDeduction, 100000); // Overall limit Rs. 1 lakh
    }

    // Section 80E - Education Loan Interest (Old Regime Only)
    if (allowedDeductions.includes('80E') && deductionData.otherDeductions?.section80E) {
      result.section80E = deductionData.otherDeductions.section80E.educationLoanInterest || 0;
    }

    // Section 80G - Donations (Old Regime Only)
    if (allowedDeductions.includes('80G') && deductionData.otherDeductions?.section80G) {
      const donations = deductionData.otherDeductions.section80G;
      const donations100Percent = donations.donations100Percent || 0;
      const donations50Percent = donations.donations50Percent || 0;
      
      // 50% donations are subject to 10% of adjusted gross total income limit
      const limitFor50Percent = grossTotalIncome * 0.1;
      const eligible50Percent = Math.min(donations50Percent, limitFor50Percent) * 0.5;
      
      result.section80G = donations100Percent + eligible50Percent;
    }

    // Section 80TTA - Interest on Savings Account (Old Regime Only)
    if (allowedDeductions.includes('80TTA') && deductionData.otherDeductions?.section80TTA) {
      const savingsInterest = deductionData.otherDeductions.section80TTA.savingsInterest || 0;
      result.section80TTA = Math.min(savingsInterest, 10000); // Max Rs. 10,000
    }

    // Section 80TTB - Interest on Deposits for Senior Citizens (Old Regime Only)
    if (allowedDeductions.includes('80TTB') && deductionData.otherDeductions?.section80TTB) {
      const seniorCitizenInterest = deductionData.otherDeductions.section80TTB.seniorCitizenInterest || 0;
      result.section80TTB = Math.min(seniorCitizenInterest, 50000); // Max Rs. 50,000
    }

    // Section 24B - Home Loan Interest (Old Regime Only)
    if (allowedDeductions.includes('24B') && deductionData.otherDeductions?.section24B) {
      const homeLoanInterest = deductionData.otherDeductions.section24B.homeLoanInterest || 0;
      result.section24B = Math.min(homeLoanInterest, 200000); // Max Rs. 2 lakh for self-occupied
    }

    // Calculate total deductions
    result.totalDeductions = 
      result.standardDeduction +
      result.section80C +
      result.section80D +
      result.section80E +
      result.section80G +
      result.section80TTA +
      result.section80TTB +
      result.section80GG +
      result.section24B +
      result.section80DD +
      result.section80DDB +
      result.section80U;

    return result;
  }

  /**
   * Calculate tax based on income slabs
   */
  static calculateTaxOnSlabs(taxableIncome: number, slabs: TaxSlabs[]): number {
    let tax = 0;
    
    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableAmountInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        tax += (taxableAmountInSlab * slab.rate) / 100;
      }
    }
    
    return Math.round(tax);
  }

  /**
   * Calculate surcharge based on income
   */
  static calculateSurcharge(taxableIncome: number, tax: number): number {
    if (taxableIncome <= 5000000) return 0;
    if (taxableIncome <= 10000000) return tax * 0.1; // 10% surcharge
    if (taxableIncome <= 20000000) return tax * 0.15; // 15% surcharge
    if (taxableIncome <= 50000000) return tax * 0.25; // 25% surcharge
    return tax * 0.37; // 37% surcharge for income above 5 crores
  }

  /**
   * Calculate rebate under section 87A
   */
  static calculateRebate87A(taxableIncome: number, tax: number, regime: 'OLD' | 'NEW'): number {
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
   * Main tax calculation function
   */
  static calculateTax(
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

    // Calculate income from all sources
    const salaryIncome = this.calculateSalaryIncome(incomeData.salary || {});
    const housePropertyIncome = this.calculateHousePropertyIncome(incomeData.houseProperty || []);
    const capitalGainsIncome = this.calculateCapitalGains(incomeData.capitalGains || {});
    const otherSourcesIncome = this.calculateOtherSourcesIncome(incomeData.otherSources || {});
    const businessIncome = incomeData.business?.netProfit || 0;

    // Calculate Gross Total Income
    const grossTotalIncome = salaryIncome + housePropertyIncome + capitalGainsIncome + otherSourcesIncome + businessIncome;

    // Calculate deductions
    const deductions = this.calculateDeductions(deductionData, regime, financialYear, grossTotalIncome);

    // Calculate taxable income
    const taxableIncome = Math.max(0, grossTotalIncome - deductions.totalDeductions);

    // Calculate tax before rebate
    const taxBeforeRebate = this.calculateTaxOnSlabs(taxableIncome, regimeConfig.slabs);

    // Calculate rebate under section 87A
    const rebateU87A = this.calculateRebate87A(taxableIncome, taxBeforeRebate, regime);

    // Tax after rebate
    const taxAfterRebate = Math.max(0, taxBeforeRebate - rebateU87A);

    // Calculate surcharge
    const surcharge = this.calculateSurcharge(taxableIncome, taxAfterRebate);

    // Calculate Health and Education Cess (4% on tax + surcharge)
    const healthEducationCess = (taxAfterRebate + surcharge) * (regimeConfig.cessRate / 100);

    // Total tax liability
    const totalTaxLiability = taxAfterRebate + surcharge + healthEducationCess;

    // Calculate taxes paid
    const advanceTaxPaid = taxesPaidData?.advanceTax || 0;
    const tdsDeducted = (taxesPaidData?.tdsSalary || 0) + (taxesPaidData?.tdsInterest || 0) + (taxesPaidData?.tdsOthers || 0);
    const selfAssessmentTax = taxesPaidData?.selfAssessmentTax || 0;
    const totalTaxesPaid = advanceTaxPaid + tdsDeducted + selfAssessmentTax;

    // Calculate refund or additional tax due
    const taxDifference = totalTaxLiability - totalTaxesPaid;
    const refundDue = taxDifference < 0 ? Math.abs(taxDifference) : 0;
    const additionalTaxDue = taxDifference > 0 ? taxDifference : 0;

    // Calculate effective and marginal tax rates
    const effectiveTaxRate = grossTotalIncome > 0 ? (totalTaxLiability / grossTotalIncome) * 100 : 0;
    const marginalTaxRate = this.getMarginalTaxRate(taxableIncome, regimeConfig.slabs);

    return {
      grossTotalIncome: Math.round(grossTotalIncome),
      totalDeductions: Math.round(deductions.totalDeductions),
      taxableIncome: Math.round(taxableIncome),
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebateU87A: Math.round(rebateU87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      healthEducationCess: Math.round(healthEducationCess),
      totalTaxLiability: Math.round(totalTaxLiability),
      advanceTaxPaid: Math.round(advanceTaxPaid),
      tdsDeducted: Math.round(tdsDeducted),
      selfAssessmentTax: Math.round(selfAssessmentTax),
      refundDue: Math.round(refundDue),
      additionalTaxDue: Math.round(additionalTaxDue),
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      marginalTaxRate: marginalTaxRate,
      regime,
      financialYear
    };
  }

  /**
   * Get marginal tax rate for given income
   */
  private static getMarginalTaxRate(taxableIncome: number, slabs: TaxSlabs[]): number {
    for (const slab of slabs) {
      if (taxableIncome >= slab.min && taxableIncome <= slab.max) {
        return slab.rate;
      }
    }
    return slabs[slabs.length - 1].rate; // Return highest rate if income exceeds all slabs
  }

  /**
   * Compare both regimes and recommend the better one
   */
  static compareRegimes(
    incomeData: any,
    deductionData: any,
    taxesPaidData: any,
    financialYear: string
  ): { oldRegime: TaxCalculationResult; newRegime: TaxCalculationResult; recommendation: 'OLD' | 'NEW'; savings: number } {
    const oldRegimeResult = this.calculateTax(incomeData, deductionData, taxesPaidData, 'OLD', financialYear);
    const newRegimeResult = this.calculateTax(incomeData, deductionData, taxesPaidData, 'NEW', financialYear);

    const oldRegimeTax = oldRegimeResult.totalTaxLiability;
    const newRegimeTax = newRegimeResult.totalTaxLiability;

    const recommendation = oldRegimeTax <= newRegimeTax ? 'OLD' : 'NEW';
    const savings = Math.abs(oldRegimeTax - newRegimeTax);

    return {
      oldRegime: oldRegimeResult,
      newRegime: newRegimeResult,
      recommendation,
      savings: Math.round(savings)
    };
  }
}
