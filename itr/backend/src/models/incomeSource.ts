export interface SalaryIncome {
  id?: string;
  userId: string;
  employerName: string;
  employerPAN: string;
  employerTAN: string;
  grossSalary: number;
  basicSalary: number;
  hra: number;
  lta: number;
  specialAllowance: number;
  otherAllowances: number;
  professionalTax: number;
  tds: number;
  form16Available: boolean;
  form16Path?: string;
  exemptAllowances: {
    hraExempt: number;
    ltaExempt: number;
    otherExempt: number;
  };
  standardDeduction: number;
  entertainmentAllowance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterestIncome {
  id?: string;
  userId: string;
  savingsAccountInterest: number;
  fixedDepositInterest: number;
  recurringDepositInterest: number;
  bondInterest: number;
  otherInterest: number;
  tdsOnInterest: number;
  bankDetails: Array<{
    bankName: string;
    accountNumber: string;
    interestEarned: number;
    tdsDeducted: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapitalGains {
  id?: string;
  userId: string;
  shortTermGains: {
    equity: number;
    other: number;
    totalGains: number;
    totalLoss: number;
  };
  longTermGains: {
    equity: number;
    other: number;
    totalGains: number;
    totalLoss: number;
  };
  transactions: Array<{
    assetType: 'equity' | 'mutual_fund' | 'property' | 'other';
    transactionType: 'buy' | 'sell';
    date: Date;
    quantity: number;
    rate: number;
    amount: number;
    brokerageCharges: number;
    stt: number;
    otherCharges: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseProperty {
  id?: string;
  userId: string;
  properties: Array<{
    propertyId: string;
    address: string;
    propertyType: 'self_occupied' | 'let_out' | 'deemed_let_out';
    annualValue: number;
    rentReceived: number;
    municipalTax: number;
    standardDeduction: number;
    interestOnLoan: number;
    principalRepayment: number;
    coOwners?: Array<{
      name: string;
      pan: string;
      sharePercentage: number;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoVDAIncome {
  id?: string;
  userId: string;
  transactions: Array<{
    transactionId: string;
    date: Date;
    type: 'buy' | 'sell' | 'transfer';
    cryptoType: string;
    quantity: number;
    rate: number;
    amount: number;
    fees: number;
    exchange: string;
  }>;
  totalGains: number;
  totalLoss: number;
  tdsDeducted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OtherIncome {
  id?: string;
  userId: string;
  dividendIncome: number;
  winningsFromLottery: number;
  winningsFromGames: number;
  interestOnRefund: number;
  familyPension: number;
  otherSources: Array<{
    description: string;
    amount: number;
    tdsDeducted: number;
  }>;
  exemptIncome: Array<{
    description: string;
    amount: number;
    section: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeSourceSummary {
  userId: string;
  salaryIncome?: SalaryIncome;
  interestIncome?: InterestIncome;
  capitalGains?: CapitalGains;
  houseProperty?: HouseProperty;
  cryptoVDAIncome?: CryptoVDAIncome;
  otherIncome?: OtherIncome;
  totalGrossIncome: number;
  totalTaxableIncome: number;
  createdAt: Date;
  updatedAt: Date;
}
