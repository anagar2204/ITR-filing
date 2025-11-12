/**
 * Tax Calculation Service
 * Production-ready tax calculation for FY 2024-25 and FY 2025-26
 * Implements official Income Tax slabs, surcharge, cess, and rebates
 */

export interface TaxInput {
  fy: '2024-25' | '2025-26';
  ageGroup: '0-60' | '60-80' | '80+';
  incomes: {
    salary: number;
    hra: number;
    otherIncome: number;
    interest: number;
    capGains: number;
  };
  deductions: {
    section80C: number;
    section80D: number;
    section80TTA: number;
    standardDeduction: number;
    otherDeductions: number;
  };
}

export interface SlabBreakdown {
  slab: string;
  income: number;
  rate: number;
  tax: number;
}

export interface RegimeResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeCess: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  rebate: number;
  netTax: number;
  slabBreakdown: SlabBreakdown[];
}

export interface TaxCalculationResult {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
  savings: number;
  recommendedRegime: 'old' | 'new';
}

// Tax Slabs for FY 2024-25 (Old Regime)
const OLD_REGIME_SLABS_2024_25 = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// Tax Slabs for FY 2024-25 (Old Regime - Senior Citizen 60-80)
const OLD_REGIME_SLABS_2024_25_SENIOR = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// Tax Slabs for FY 2024-25 (Old Regime - Super Senior Citizen 80+)
const OLD_REGIME_SLABS_2024_25_SUPER_SENIOR = [
  { min: 0, max: 500000, rate: 0 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// Tax Slabs for FY 2024-25 (New Regime)
const NEW_REGIME_SLABS_2024_25 = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

// Tax Slabs for FY 2025-26 (Old Regime) - Same as 2024-25
const OLD_REGIME_SLABS_2025_26 = OLD_REGIME_SLABS_2024_25;
const OLD_REGIME_SLABS_2025_26_SENIOR = OLD_REGIME_SLABS_2024_25_SENIOR;
const OLD_REGIME_SLABS_2025_26_SUPER_SENIOR = OLD_REGIME_SLABS_2024_25_SUPER_SENIOR;

// Tax Slabs for FY 2025-26 (New Regime) - Updated with latest Budget provisions
const NEW_REGIME_SLABS_2025_26 = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

// Surcharge thresholds and rates
const SURCHARGE_SLABS = [
  { min: 0, max: 5000000, rate: 0 },
  { min: 5000000, max: 10000000, rate: 10 },
  { min: 10000000, max: 20000000, rate: 15 },
  { min: 20000000, max: 50000000, rate: 25 },
  { min: 50000000, max: Infinity, rate: 37 },
];

// Health & Education Cess
const CESS_RATE = 4; // 4% on tax + surcharge

// Rebate u/s 87A
const REBATE_LIMIT_OLD = 500000; // For old regime
const REBATE_LIMIT_NEW_2024_25 = 700000; // For new regime FY 2024-25
const REBATE_LIMIT_NEW_2025_26 = 700000; // For new regime FY 2025-26
const REBATE_AMOUNT = 12500; // Max rebate amount (old regime)
const REBATE_AMOUNT_NEW = 25000; // Max rebate amount (new regime)

// Standard Deduction
const STANDARD_DEDUCTION_OLD = 50000;
const STANDARD_DEDUCTION_NEW_2024_25 = 50000;
const STANDARD_DEDUCTION_NEW_2025_26 = 75000; // Updated for FY 2025-26

/**
 * Get tax slabs based on FY, regime, and age group
 */
function getTaxSlabs(fy: string, regime: 'old' | 'new', ageGroup: string) {
  if (regime === 'new') {
    return fy === '2024-25' ? NEW_REGIME_SLABS_2024_25 : NEW_REGIME_SLABS_2025_26;
  }
  
  // Old regime - age-based slabs
  if (ageGroup === '80+') {
    return fy === '2024-25' ? OLD_REGIME_SLABS_2024_25_SUPER_SENIOR : OLD_REGIME_SLABS_2025_26_SUPER_SENIOR;
  } else if (ageGroup === '60-80') {
    return fy === '2024-25' ? OLD_REGIME_SLABS_2024_25_SENIOR : OLD_REGIME_SLABS_2025_26_SENIOR;
  }
  return fy === '2024-25' ? OLD_REGIME_SLABS_2024_25 : OLD_REGIME_SLABS_2025_26;
}

/**
 * Calculate tax based on slabs
 */
function calculateTaxFromSlabs(income: number, slabs: typeof OLD_REGIME_SLABS_2024_25): { tax: number; breakdown: SlabBreakdown[] } {
  let totalTax = 0;
  const breakdown: SlabBreakdown[] = [];
  
  for (const slab of slabs) {
    if (income <= slab.min) break;
    
    const taxableInSlab = Math.min(income, slab.max) - slab.min;
    const taxInSlab = (taxableInSlab * slab.rate) / 100;
    
    if (taxableInSlab > 0) {
      breakdown.push({
        slab: slab.max === Infinity 
          ? `Above ₹${(slab.min / 100000).toFixed(1)}L`
          : `₹${(slab.min / 100000).toFixed(1)}L - ₹${(slab.max / 100000).toFixed(1)}L`,
        income: Math.round(taxableInSlab),
        rate: slab.rate,
        tax: Math.round(taxInSlab),
      });
      totalTax += taxInSlab;
    }
  }
  
  return { tax: Math.round(totalTax), breakdown };
}

/**
 * Calculate surcharge based on income
 */
function calculateSurcharge(income: number, baseTax: number): number {
  const surchargeRate = SURCHARGE_SLABS.find(s => income > s.min && income <= s.max)?.rate || 0;
  return Math.round((baseTax * surchargeRate) / 100);
}

/**
 * Calculate cess (4% on tax + surcharge)
 */
function calculateCess(taxPlusSurcharge: number): number {
  return Math.round((taxPlusSurcharge * CESS_RATE) / 100);
}

/**
 * Calculate rebate u/s 87A
 */
function calculateRebate(income: number, tax: number, regime: 'old' | 'new', fy: string): number {
  if (regime === 'old') {
    if (income <= REBATE_LIMIT_OLD) {
      return Math.min(tax, REBATE_AMOUNT);
    }
  } else {
    const rebateLimit = fy === '2024-25' ? REBATE_LIMIT_NEW_2024_25 : REBATE_LIMIT_NEW_2025_26;
    if (income <= rebateLimit) {
      return Math.min(tax, REBATE_AMOUNT_NEW);
    }
  }
  return 0;
}

/**
 * Calculate tax for a specific regime
 */
function calculateRegimeTax(
  input: TaxInput,
  regime: 'old' | 'new'
): RegimeResult {
  const { fy, ageGroup, incomes, deductions } = input;
  
  // Calculate gross income
  const grossIncome = 
    incomes.salary +
    incomes.hra +
    incomes.otherIncome +
    incomes.interest +
    incomes.capGains;
  
  // Calculate total deductions (regime-specific)
  let totalDeductions = 0;
  
  if (regime === 'old') {
    // Old regime allows all deductions
    totalDeductions =
      deductions.section80C +
      deductions.section80D +
      deductions.section80TTA +
      (deductions.standardDeduction || STANDARD_DEDUCTION_OLD) +
      deductions.otherDeductions;
  } else {
    // New regime - only standard deduction
    const stdDeduction = fy === '2025-26' ? STANDARD_DEDUCTION_NEW_2025_26 : STANDARD_DEDUCTION_NEW_2024_25;
    totalDeductions = stdDeduction;
  }
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  
  // Get applicable slabs
  const slabs = getTaxSlabs(fy, regime, ageGroup);
  
  // Calculate tax from slabs
  const { tax: baseTax, breakdown } = calculateTaxFromSlabs(taxableIncome, slabs);
  
  // Calculate surcharge
  const surcharge = calculateSurcharge(taxableIncome, baseTax);
  
  // Calculate cess
  const taxPlusSurcharge = baseTax + surcharge;
  const cess = calculateCess(taxPlusSurcharge);
  
  // Total tax before rebate
  const totalTaxBeforeRebate = baseTax + surcharge + cess;
  
  // Calculate rebate
  const rebate = calculateRebate(taxableIncome, totalTaxBeforeRebate, regime, fy);
  
  // Net tax after rebate
  const netTax = Math.max(0, totalTaxBeforeRebate - rebate);
  
  return {
    grossIncome: Math.round(grossIncome),
    totalDeductions: Math.round(totalDeductions),
    taxableIncome: Math.round(taxableIncome),
    taxBeforeCess: Math.round(baseTax),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax: Math.round(totalTaxBeforeRebate),
    rebate: Math.round(rebate),
    netTax: Math.round(netTax),
    slabBreakdown: breakdown,
  };
}

/**
 * Main tax calculation function
 */
export function calculateTax(input: TaxInput): TaxCalculationResult {
  // Validate input
  if (!input.fy || !['2024-25', '2025-26'].includes(input.fy)) {
    throw new Error('Invalid financial year. Must be 2024-25 or 2025-26');
  }
  
  if (!input.ageGroup || !['0-60', '60-80', '80+'].includes(input.ageGroup)) {
    throw new Error('Invalid age group. Must be 0-60, 60-80, or 80+');
  }
  
  // Calculate for both regimes
  const oldRegime = calculateRegimeTax(input, 'old');
  const newRegime = calculateRegimeTax(input, 'new');
  
  // Calculate savings
  const savings = oldRegime.netTax - newRegime.netTax;
  const recommendedRegime = newRegime.netTax < oldRegime.netTax ? 'new' : 'old';
  
  return {
    oldRegime,
    newRegime,
    savings: Math.round(savings),
    recommendedRegime,
  };
}

/**
 * Validate tax input
 */
export function validateTaxInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.fy || !['2024-25', '2025-26'].includes(input.fy)) {
    errors.push('Invalid or missing financial year');
  }
  
  if (!input.ageGroup || !['0-60', '60-80', '80+'].includes(input.ageGroup)) {
    errors.push('Invalid or missing age group');
  }
  
  if (!input.incomes || typeof input.incomes !== 'object') {
    errors.push('Missing incomes object');
  } else {
    const incomeFields = ['salary', 'hra', 'otherIncome', 'interest', 'capGains'];
    for (const field of incomeFields) {
      if (typeof input.incomes[field] !== 'number' || input.incomes[field] < 0) {
        errors.push(`Invalid ${field}: must be a non-negative number`);
      }
      if (input.incomes[field] > 100000000000) {
        errors.push(`Invalid ${field}: exceeds maximum allowed value`);
      }
    }
  }
  
  if (!input.deductions || typeof input.deductions !== 'object') {
    errors.push('Missing deductions object');
  } else {
    const deductionFields = ['section80C', 'section80D', 'section80TTA', 'standardDeduction', 'otherDeductions'];
    for (const field of deductionFields) {
      if (typeof input.deductions[field] !== 'number' || input.deductions[field] < 0) {
        errors.push(`Invalid ${field}: must be a non-negative number`);
      }
      if (input.deductions[field] > 100000000) {
        errors.push(`Invalid ${field}: exceeds maximum allowed value`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
