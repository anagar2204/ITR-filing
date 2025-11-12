/**
 * Tax Calculator Service
 * Implements FY 2024-25 tax calculation logic for both old and new regimes
 */

export interface TaxInput {
  salaryGross: number;
  salaryExempt?: number;
  otherIncome?: number;
  deductions?: {
    section80C?: number;
    section80D?: number;
    section80E?: number;
    section80G?: number;
    hraClaimed?: number;
  };
}

export interface TaxResult {
  regime: 'old' | 'new';
  totalIncome: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxPayable: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
}

export interface TaxComparison {
  old: TaxResult;
  new: TaxResult;
  recommendation: 'old' | 'new';
  savings: number;
}

const STANDARD_DEDUCTION = 50000;
const CESS_RATE = 0.04; // 4%

/**
 * Calculate tax under NEW regime (FY 2024-25)
 */
export function calculateNewRegime(input: TaxInput): TaxResult {
  // Step 1: Calculate total income
  const totalIncome = input.salaryGross + (input.otherIncome || 0);
  
  // Step 2: Apply standard deduction
  const taxableIncome = Math.max(0, totalIncome - STANDARD_DEDUCTION);
  
  // Step 3: Calculate tax based on slabs
  let tax = 0;
  
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 700000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 20000 + (taxableIncome - 700000) * 0.10;
  } else if (taxableIncome <= 1200000) {
    tax = 50000 + (taxableIncome - 1000000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 80000 + (taxableIncome - 1200000) * 0.20;
  } else {
    tax = 140000 + (taxableIncome - 1500000) * 0.30;
  }
  
  // Step 4: Apply rebate under Section 87A
  let rebate87A = 0;
  if (taxableIncome <= 700000) {
    rebate87A = Math.min(tax, 25000);
  }
  
  const taxAfterRebate = Math.max(0, tax - rebate87A);
  
  // Step 5: Add cess
  const cess = Math.round(taxAfterRebate * CESS_RATE);
  const totalTax = taxAfterRebate + cess;
  
  return {
    regime: 'new',
    totalIncome,
    taxableIncome,
    taxBeforeRebate: Math.round(tax),
    rebate87A: Math.round(rebate87A),
    taxPayable: Math.round(taxAfterRebate),
    cess,
    totalTax: Math.round(totalTax),
    effectiveRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0
  };
}

/**
 * Calculate tax under OLD regime (FY 2024-25)
 */
export function calculateOldRegime(input: TaxInput): TaxResult {
  const deductions = input.deductions || {};
  
  // Step 1: Calculate total income
  const totalIncome = input.salaryGross + (input.otherIncome || 0);
  
  // Step 2: Apply standard deduction
  let incomeAfterStandardDeduction = Math.max(0, totalIncome - STANDARD_DEDUCTION);
  
  // Step 3: Apply Chapter VI-A deductions
  const section80C = Math.min(deductions.section80C || 0, 150000);
  const section80D = Math.min(deductions.section80D || 0, 25000);
  const section80E = deductions.section80E || 0; // No limit
  const section80G = deductions.section80G || 0;
  
  const totalDeductions = section80C + section80D + section80E + section80G;
  
  // Step 4: Calculate taxable income
  const taxableIncome = Math.max(0, incomeAfterStandardDeduction - totalDeductions);
  
  // Step 5: Calculate tax based on slabs
  let tax = 0;
  
  if (taxableIncome <= 250000) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 12500 + (taxableIncome - 500000) * 0.20;
  } else {
    tax = 112500 + (taxableIncome - 1000000) * 0.30;
  }
  
  // Step 6: Apply rebate under Section 87A
  let rebate87A = 0;
  if (taxableIncome <= 500000) {
    rebate87A = Math.min(tax, 12500);
  }
  
  const taxAfterRebate = Math.max(0, tax - rebate87A);
  
  // Step 7: Add cess
  const cess = Math.round(taxAfterRebate * CESS_RATE);
  const totalTax = taxAfterRebate + cess;
  
  return {
    regime: 'old',
    totalIncome,
    taxableIncome,
    taxBeforeRebate: Math.round(tax),
    rebate87A: Math.round(rebate87A),
    taxPayable: Math.round(taxAfterRebate),
    cess,
    totalTax: Math.round(totalTax),
    effectiveRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0
  };
}

/**
 * Compare both regimes and provide recommendation
 */
export function compareTaxRegimes(input: TaxInput): TaxComparison {
  const oldRegime = calculateOldRegime(input);
  const newRegime = calculateNewRegime(input);
  
  const recommendation = newRegime.totalTax <= oldRegime.totalTax ? 'new' : 'old';
  const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);
  
  return {
    old: oldRegime,
    new: newRegime,
    recommendation,
    savings
  };
}

/**
 * Calculate HRA exemption
 */
export function calculateHRAExemption(
  basicSalary: number,
  hra: number,
  rentPaid: number,
  isMetro: boolean
): number {
  const metroPercent = isMetro ? 0.50 : 0.40;
  
  const exemption1 = hra;
  const exemption2 = basicSalary * metroPercent;
  const exemption3 = Math.max(0, rentPaid - (basicSalary * 0.10));
  
  return Math.min(exemption1, exemption2, exemption3);
}

/**
 * Optimize deductions for maximum tax savings
 */
export function optimizeDeductions(
  income: number,
  currentDeductions: TaxInput['deductions']
): {
  suggestions: string[];
  potentialSavings: number;
  optimizedDeductions: TaxInput['deductions'];
} {
  const suggestions: string[] = [];
  const optimized = { ...currentDeductions };
  
  // Check 80C
  const current80C = currentDeductions?.section80C || 0;
  if (current80C < 150000) {
    const remaining = 150000 - current80C;
    suggestions.push(`Invest ₹${remaining.toLocaleString()} more in 80C to maximize deduction (PPF, ELSS, etc.)`);
    optimized.section80C = 150000;
  }
  
  // Check 80D
  const current80D = currentDeductions?.section80D || 0;
  if (current80D < 25000) {
    const remaining = 25000 - current80D;
    suggestions.push(`Get health insurance worth ₹${remaining.toLocaleString()} for 80D deduction`);
    optimized.section80D = 25000;
  }
  
  // Calculate potential savings
  const currentTax = calculateOldRegime({
    salaryGross: income,
    deductions: currentDeductions
  });
  
  const optimizedTax = calculateOldRegime({
    salaryGross: income,
    deductions: optimized
  });
  
  const potentialSavings = currentTax.totalTax - optimizedTax.totalTax;
  
  return {
    suggestions,
    potentialSavings,
    optimizedDeductions: optimized
  };
}
