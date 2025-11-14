// Tax Savings and Deductions Models

export interface Section80CDeduction {
  id?: string;
  userId: string;
  
  // Life Insurance
  lifeInsurancePremium: number;
  
  // Provident Fund
  epfContribution: number;
  vpfContribution: number;
  ppfContribution: number;
  
  // Investment Options
  elssInvestment: number;
  nscInvestment: number;
  taxSaverFD: number;
  sukanyaSamriddhiYojana: number;
  
  // Home Loan
  homeLoanPrincipal: number;
  
  // Education
  tuitionFees: number;
  
  // Other Investments
  ulipPremium: number;
  pensionFundContribution: number;
  infrastructureBonds: number;
  
  // Additional Sections
  section80CCC: number; // Pension Fund
  section80CCD1: number; // NPS Contribution (Tier 1)
  section80CCD1B: number; // Additional NPS Contribution
  
  totalDeduction: number;
  maxLimit: number; // 150000 for 80C + 80CCC + 80CCD(1)
  additionalNPSLimit: number; // 50000 for 80CCD(1B)
  
  documents: Array<{
    type: string;
    fileName: string;
    filePath: string;
    amount: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Section80DDeduction {
  id?: string;
  userId: string;
  
  // Self and Family
  selfFamilyPremium: number;
  selfFamilyPreventiveCheckup: number;
  selfFamilyMedicalExpenses: number; // For senior citizens without insurance
  
  // Parents
  parentsPremium: number;
  parentsPreventiveCheckup: number;
  parentsMedicalExpenses: number; // For senior citizens without insurance
  
  // Age Categories
  selfAge: 'below60' | 'above60';
  spouseAge: 'below60' | 'above60';
  parentsAge: 'below60' | 'above60';
  
  // Limits
  selfFamilyLimit: number; // 25000 or 50000 based on age
  parentsLimit: number; // 25000 or 50000 based on age
  totalDeduction: number;
  
  // CGHS/Government Scheme
  cghsContribution: number;
  
  documents: Array<{
    type: 'premium' | 'checkup' | 'medical_expense';
    category: 'self_family' | 'parents';
    fileName: string;
    filePath: string;
    amount: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxesPaidTDSTCS {
  id?: string;
  userId: string;
  
  // TDS Details
  tdsOnSalary: number;
  tdsOnInterest: number;
  tdsOnDividend: number;
  tdsOnRent: number;
  tdsOnProfessionalFees: number;
  tdsOnCommission: number;
  tdsOnOthers: number;
  
  // TCS Details
  tcsOnSaleOfGoods: number;
  tcsOnForeignRemittance: number;
  tcsOnMotorVehicle: number;
  tcsOnOthers: number;
  
  // Advance Tax
  advanceTaxPaid: number;
  selfAssessmentTax: number;
  
  // Form 26AS Data
  form26ASData: Array<{
    deductorName: string;
    deductorTAN: string;
    transactionDate: Date;
    amount: number;
    tdsAmount: number;
    type: 'TDS' | 'TCS' | 'ADVANCE_TAX';
    section: string;
  }>;
  
  totalTDSClaimed: number;
  totalTCSClaimed: number;
  totalAdvanceTax: number;
  
  documents: Array<{
    type: 'form16' | 'form16A' | 'form26AS' | 'challan' | 'certificate';
    fileName: string;
    filePath: string;
    amount: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CarryForwardLosses {
  id?: string;
  userId: string;
  
  // Business Losses (Section 72)
  businessLosses: Array<{
    assessmentYear: string;
    lossAmount: number;
    remainingAmount: number;
    businessType: 'non_speculative' | 'speculative';
    carryForwardYears: number; // 8 for non-speculative, 4 for speculative
    returnFiledOnTime: boolean;
  }>;
  
  // Capital Losses (Section 74)
  capitalLosses: Array<{
    assessmentYear: string;
    shortTermLoss: number;
    longTermLoss: number;
    remainingSTCL: number;
    remainingLTCL: number;
    carryForwardYears: number; // 8 years
  }>;
  
  // House Property Losses (Section 71B)
  housePropertyLosses: Array<{
    assessmentYear: string;
    lossAmount: number;
    remainingAmount: number;
    carryForwardYears: number; // 8 years
    applicableInNewRegime: boolean; // false
  }>;
  
  // Unabsorbed Depreciation
  unabsorbedDepreciation: Array<{
    assessmentYear: string;
    depreciationAmount: number;
    remainingAmount: number;
    carryForwardYears: number; // Indefinite
  }>;
  
  // Set-off in Current Year
  currentYearSetOff: {
    businessLossSetOff: number;
    capitalLossSetOff: number;
    housePropertyLossSetOff: number;
    depreciationSetOff: number;
  };
  
  documents: Array<{
    type: 'previous_itr' | 'computation' | 'audit_report';
    assessmentYear: string;
    fileName: string;
    filePath: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OtherDeductions {
  id?: string;
  userId: string;
  
  // Section 80E - Education Loan Interest
  section80E: {
    educationLoanInterest: number;
    loanDetails: Array<{
      bankName: string;
      loanAccountNumber: string;
      interestPaid: number;
      certificateNumber: string;
    }>;
  };
  
  // Section 80G - Donations
  section80G: {
    donations100Percent: number; // 100% deduction
    donations50Percent: number; // 50% deduction
    donationDetails: Array<{
      organizationName: string;
      organizationPAN: string;
      amount: number;
      deductionPercentage: number;
      receiptNumber: string;
      donationDate: Date;
    }>;
  };
  
  // Section 80GG - House Rent (if HRA not received)
  section80GG: {
    rentPaid: number;
    landlordName: string;
    landlordPAN: string;
    cityType: 'metro' | 'non_metro';
    eligibleDeduction: number;
  };
  
  // Section 80TTA/80TTB - Interest on Savings Account
  section80TTA: {
    savingsInterest: number; // Max 10000 for individuals below 60
    eligibleDeduction: number;
  };
  
  section80TTB: {
    savingsInterest: number; // Max 50000 for senior citizens
    eligibleDeduction: number;
  };
  
  // Section 24B - Home Loan Interest
  section24B: {
    homeLoanInterest: number;
    propertyType: 'self_occupied' | 'let_out';
    maxDeduction: number; // 200000 for self-occupied
  };
  
  // Section 80DD - Disabled Dependent
  section80DD: {
    dependentType: 'normal' | 'severe';
    deductionAmount: number; // 75000 or 125000
    dependentDetails: {
      name: string;
      relationship: string;
      disabilityPercentage: number;
      certificateNumber: string;
    };
  };
  
  // Section 80DDB - Medical Treatment
  section80DDB: {
    medicalExpenses: number;
    patientAge: 'below60' | 'above60';
    diseaseType: 'specified' | 'other';
    maxDeduction: number; // 40000 or 100000
  };
  
  // Section 80U - Self Disability
  section80U: {
    disabilityType: 'normal' | 'severe';
    deductionAmount: number; // 75000 or 125000
    disabilityPercentage: number;
    certificateNumber: string;
  };
  
  totalOtherDeductions: number;
  
  documents: Array<{
    section: string;
    type: string;
    fileName: string;
    filePath: string;
    amount: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxSavingsSummary {
  userId: string;
  section80C?: Section80CDeduction;
  section80D?: Section80DDeduction;
  taxesPaid?: TaxesPaidTDSTCS;
  carryForwardLosses?: CarryForwardLosses;
  otherDeductions?: OtherDeductions;
  
  totalDeductions: number;
  totalTaxesPaid: number;
  netTaxLiability: number;
  refundDue: number;
  additionalTaxDue: number;
  
  createdAt: Date;
  updatedAt: Date;
}
