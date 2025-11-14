export class MathematicalValidationService {
  
  /**
   * Validate and correct income calculations with mathematical precision
   */
  static validateIncomeCalculation(incomeData: any): any {
    const correctedIncome = { ...incomeData };
    
    // Validate salary calculation
    if (correctedIncome.salary) {
      correctedIncome.salary = this.validateSalaryCalculation(correctedIncome.salary);
    }
    
    // Validate house property calculation
    if (correctedIncome.houseProperty) {
      correctedIncome.houseProperty = this.validateHousePropertyCalculation(correctedIncome.houseProperty);
    }
    
    // Validate other sources
    if (correctedIncome.otherSources) {
      correctedIncome.otherSources = this.validateOtherSourcesCalculation(correctedIncome.otherSources);
    }
    
    return correctedIncome;
  }

  /**
   * Validate salary calculation with mathematical precision
   */
  private static validateSalaryCalculation(salary: any): any {
    const validated = { ...salary };
    
    // Ensure all numeric values are properly rounded
    validated.basicSalary = Math.round(validated.basicSalary || 0);
    validated.hra = Math.round(validated.hra || 0);
    validated.allowances = Math.round(validated.allowances || 0);
    validated.bonuses = Math.round(validated.bonuses || 0);
    validated.professionalTax = Math.round(validated.professionalTax || 0);
    
    // Calculate HRA exemption with mathematical precision
    const hraExemption = this.calculatePreciseHRAExemption(
      validated.hra,
      validated.basicSalary,
      validated.rentPaid || 0,
      validated.cityType || 'metro'
    );
    
    // Calculate net salary income
    validated.netSalaryIncome = validated.basicSalary + 
                               validated.hra - hraExemption +
                               validated.allowances +
                               validated.bonuses -
                               validated.professionalTax;
    
    validated.hraExemption = hraExemption;
    
    return validated;
  }

  /**
   * Calculate HRA exemption with mathematical precision
   */
  private static calculatePreciseHRAExemption(
    hraReceived: number,
    basicSalary: number,
    rentPaid: number,
    cityType: string
  ): number {
    if (hraReceived === 0 || rentPaid === 0) return 0;
    
    const cityPercentage = cityType === 'metro' ? 0.5 : 0.4;
    const salaryBasedExemption = Math.round(basicSalary * cityPercentage);
    const rentBasedExemption = Math.max(0, Math.round(rentPaid - (basicSalary * 0.1)));
    
    return Math.min(hraReceived, salaryBasedExemption, rentBasedExemption);
  }

  /**
   * Validate house property calculation
   */
  private static validateHousePropertyCalculation(houseProperty: any[]): any[] {
    return houseProperty.map(property => ({
      ...property,
      rentalIncome: Math.round(property.rentalIncome || 0),
      municipalTax: Math.round(property.municipalTax || 0),
      interestOnLoan: Math.round(property.interestOnLoan || 0),
      otherExpenses: Math.round(property.otherExpenses || 0),
      netIncome: Math.max(0, Math.round(
        (property.rentalIncome || 0) - 
        (property.municipalTax || 0) - 
        (property.interestOnLoan || 0) - 
        (property.otherExpenses || 0)
      ))
    }));
  }

  /**
   * Validate other sources calculation
   */
  private static validateOtherSourcesCalculation(otherSources: any): any {
    return {
      ...otherSources,
      interestIncome: Math.round(otherSources.interestIncome || 0),
      dividendIncome: Math.round(otherSources.dividendIncome || 0),
      otherIncome: Math.round(otherSources.otherIncome || 0)
    };
  }

  /**
   * Validate deduction calculations with mathematical precision
   */
  static validateDeductionCalculation(deductionData: any, regime: 'OLD' | 'NEW'): any {
    if (regime === 'NEW') {
      return {
        section80C: { total: 0 },
        section80D: { total: 0 },
        otherDeductions: { total: 0 },
        standardDeduction: 75000,
        totalDeductions: 75000
      };
    }

    const section80C = this.validateSection80C(deductionData.section80C || {});
    const section80D = this.validateSection80D(deductionData.section80D || {});
    const otherDeductions = this.validateOtherDeductions(deductionData.otherDeductions || {});
    const standardDeduction = 75000;

    return {
      section80C,
      section80D,
      otherDeductions,
      standardDeduction,
      totalDeductions: section80C.total + section80D.total + otherDeductions.total + standardDeduction
    };
  }

  /**
   * Validate Section 80C with mathematical precision
   */
  private static validateSection80C(section80CData: any): any {
    const components = {
      lifeInsurancePremium: Math.min(Math.round(section80CData.lifeInsurancePremium || 0), 150000),
      epfContribution: Math.min(Math.round(section80CData.epfContribution || 0), 150000),
      ppfContribution: Math.min(Math.round(section80CData.ppfContribution || 0), 150000),
      elssInvestment: Math.min(Math.round(section80CData.elssInvestment || 0), 150000),
      nscInvestment: Math.min(Math.round(section80CData.nscInvestment || 0), 150000),
      sukanyaSamriddhiYojana: Math.min(Math.round(section80CData.sukanyaSamriddhiYojana || 0), 150000),
      homeLoanPrincipal: Math.min(Math.round(section80CData.homeLoanPrincipal || 0), 150000),
      tuitionFees: Math.min(Math.round(section80CData.tuitionFees || 0), 150000)
    };

    const subtotal = Object.values(components).reduce((sum, val) => sum + val, 0);
    const total = Math.min(subtotal, 150000);

    return {
      ...components,
      subtotal,
      total,
      limit: 150000
    };
  }

  /**
   * Validate Section 80D with mathematical precision
   */
  private static validateSection80D(section80DData: any): any {
    const selfFamilyPremium = Math.round(section80DData.selfFamilyPremium || 0);
    const parentsPremium = Math.round(section80DData.parentsPremium || 0);
    const selfFamilyCheckup = Math.round(section80DData.selfFamilyPreventiveCheckup || 0);
    const parentsCheckup = Math.round(section80DData.parentsPreventiveCheckup || 0);

    const selfFamilyLimit = 25000;
    const parentsLimit = 50000;

    const selfFamilyTotal = Math.min(selfFamilyPremium + selfFamilyCheckup, selfFamilyLimit);
    const parentsTotal = Math.min(parentsPremium + parentsCheckup, parentsLimit);

    return {
      selfFamilyPremium,
      parentsPremium,
      selfFamilyCheckup,
      parentsCheckup,
      selfFamilyTotal,
      parentsTotal,
      total: selfFamilyTotal + parentsTotal
    };
  }

  /**
   * Validate other deductions
   */
  private static validateOtherDeductions(otherDeductionsData: any): any {
    const components = {
      section80E: Math.round(otherDeductionsData.section80E || 0),
      section80G: Math.min(Math.round(otherDeductionsData.section80G || 0), 200000),
      section80TTA: Math.min(Math.round(otherDeductionsData.section80TTA || 0), 10000),
      section80TTB: Math.min(Math.round(otherDeductionsData.section80TTB || 0), 50000),
      section80GG: Math.min(Math.round(otherDeductionsData.section80GG || 0), 60000),
      section24B: Math.min(Math.round(otherDeductionsData.section24B || 0), 200000)
    };

    return {
      ...components,
      total: Object.values(components).reduce((sum, val) => sum + val, 0)
    };
  }

  /**
   * Calculate tax with mathematical precision
   */
  static calculatePreciseTax(taxableIncome: number, slabs: any[]): number {
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const slab of slabs) {
      if (remainingIncome <= 0) break;

      const slabMin = slab.min;
      const slabMax = slab.max === Infinity ? Infinity : slab.max;
      const slabRate = slab.rate / 100;

      if (taxableIncome > slabMin) {
        const taxableInThisSlab = Math.min(remainingIncome, slabMax - slabMin);
        const taxInThisSlab = Math.round(taxableInThisSlab * slabRate);
        tax += taxInThisSlab;
        remainingIncome -= taxableInThisSlab;
      }
    }

    return Math.round(tax);
  }

  /**
   * Calculate rebate with mathematical precision
   */
  static calculatePreciseRebate(taxableIncome: number, tax: number, regime: 'OLD' | 'NEW'): number {
    if (regime === 'OLD') {
      if (taxableIncome <= 500000) {
        return Math.min(tax, 12500);
      }
    } else {
      if (taxableIncome <= 700000) {
        return Math.min(tax, 25000);
      }
    }
    return 0;
  }

  /**
   * Calculate surcharge with mathematical precision
   */
  static calculatePreciseSurcharge(grossIncome: number, tax: number): number {
    if (grossIncome <= 5000000) return 0;

    let surchargeRate = 0;
    if (grossIncome <= 10000000) {
      surchargeRate = 0.10;
    } else if (grossIncome <= 20000000) {
      surchargeRate = 0.15;
    } else if (grossIncome <= 50000000) {
      surchargeRate = 0.25;
    } else {
      surchargeRate = 0.37;
    }

    return Math.round(tax * surchargeRate);
  }

  /**
   * Calculate cess with mathematical precision
   */
  static calculatePreciseCess(taxPlusSurcharge: number): number {
    return Math.round(taxPlusSurcharge * 0.04);
  }

  /**
   * Validate final tax calculation
   */
  static validateFinalTaxCalculation(
    grossIncome: number,
    deductions: number,
    taxBeforeRebate: number,
    rebate: number,
    surcharge: number,
    cess: number
  ): any {
    const taxableIncome = Math.max(0, Math.round(grossIncome - deductions));
    const taxAfterRebate = Math.max(0, Math.round(taxBeforeRebate - rebate));
    const totalTax = Math.round(taxAfterRebate + surcharge + cess);

    return {
      grossIncome: Math.round(grossIncome),
      totalDeductions: Math.round(deductions),
      taxableIncome,
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebate: Math.round(rebate),
      taxAfterRebate,
      surcharge: Math.round(surcharge),
      cess: Math.round(cess),
      totalTaxLiability: totalTax,
      effectiveRate: grossIncome > 0 ? Math.round((totalTax / grossIncome) * 10000) / 100 : 0
    };
  }

  /**
   * Comprehensive accuracy validation
   */
  static validateCalculationAccuracy(
    expected: any,
    actual: any,
    tolerance: number = 0.01
  ): any {
    const validations = [];

    // Validate gross income
    const grossIncomeAccuracy = this.calculateFieldAccuracy(
      expected.grossIncome || 0,
      actual.grossIncome || 0,
      tolerance
    );
    validations.push({
      field: 'Gross Income',
      expected: expected.grossIncome || 0,
      actual: actual.grossIncome || 0,
      accuracy: grossIncomeAccuracy,
      passed: grossIncomeAccuracy >= 95
    });

    // Validate deductions
    const deductionAccuracy = this.calculateFieldAccuracy(
      expected.totalDeductions || 0,
      actual.totalDeductions || 0,
      tolerance
    );
    validations.push({
      field: 'Total Deductions',
      expected: expected.totalDeductions || 0,
      actual: actual.totalDeductions || 0,
      accuracy: deductionAccuracy,
      passed: deductionAccuracy >= 95
    });

    // Validate taxable income
    const taxableIncomeAccuracy = this.calculateFieldAccuracy(
      expected.taxableIncome || 0,
      actual.taxableIncome || 0,
      tolerance
    );
    validations.push({
      field: 'Taxable Income',
      expected: expected.taxableIncome || 0,
      actual: actual.taxableIncome || 0,
      accuracy: taxableIncomeAccuracy,
      passed: taxableIncomeAccuracy >= 98
    });

    // Validate tax calculation
    const taxAccuracy = this.calculateFieldAccuracy(
      expected.totalTaxLiability || 0,
      actual.totalTaxLiability || 0,
      tolerance
    );
    validations.push({
      field: 'Total Tax Liability',
      expected: expected.totalTaxLiability || 0,
      actual: actual.totalTaxLiability || 0,
      accuracy: taxAccuracy,
      passed: taxAccuracy >= 95
    });

    const overallAccuracy = validations.reduce((sum, v) => sum + v.accuracy, 0) / validations.length;

    return {
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      validations,
      passed: overallAccuracy >= 90,
      recommendations: this.generateAccuracyRecommendations(validations)
    };
  }

  /**
   * Calculate field accuracy percentage
   */
  private static calculateFieldAccuracy(expected: number, actual: number, tolerance: number = 0.01): number {
    if (expected === 0 && actual === 0) return 100;
    if (expected === 0) return actual === 0 ? 100 : 0;

    const difference = Math.abs(expected - actual);
    const percentageDifference = difference / expected;

    if (percentageDifference <= tolerance) return 100;

    const accuracy = Math.max(0, 100 - (percentageDifference * 100));
    return Math.round(accuracy * 100) / 100;
  }

  /**
   * Generate accuracy recommendations
   */
  private static generateAccuracyRecommendations(validations: any[]): string[] {
    const recommendations = [];

    validations.forEach(validation => {
      if (!validation.passed) {
        if (validation.field === 'Gross Income') {
          recommendations.push('Review income calculation logic, especially HRA and allowance exemptions');
        } else if (validation.field === 'Total Deductions') {
          recommendations.push('Verify deduction limits and calculation logic for Section 80C, 80D');
        } else if (validation.field === 'Taxable Income') {
          recommendations.push('Check taxable income calculation: Gross Income - Total Deductions');
        } else if (validation.field === 'Total Tax Liability') {
          recommendations.push('Review tax slab calculations, rebates, surcharge, and cess logic');
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All calculations are accurate! System is working correctly.');
    }

    return recommendations;
  }
}
