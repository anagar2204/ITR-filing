const { TaxRulesEngine } = require('./dist/services/taxRulesEngine');

const input = {
  assessmentYear: '2024-25',
  regime: 'new',
  ageGroup: 'general',
  incomes: {
    salary: 0,
    interest: 0,
    capitalGains: { 
      shortTerm: 200000, 
      longTerm: 250000
    },
    property: 0,
    crypto: 0,
    other: 0,
    exempt: 0
  },
  deductions: {
    section80C: 0,
    section80D: 0,
    section80TTA: 0,
    section80CCD: 0,
    other: 0
  },
  tdsAndTcs: {
    tds: 0,
    tcs: 0,
    advanceTax: 0
  }
};

console.log('Input:', JSON.stringify(input, null, 2));

try {
  const result = TaxRulesEngine.calculate(input);
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}
