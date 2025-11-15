const Decimal = require('decimal.js');

/**
 * Parse money string to Decimal, handling currency symbols and formatting
 * @param {string|number} value - The value to parse
 * @returns {Decimal} - Parsed decimal value
 */
function parseMoney(value) {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }
  
  if (typeof value === 'number') {
    return new Decimal(value);
  }
  
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[₹$,\s]/g, '');
    
    // Handle empty string after cleaning
    if (cleaned === '' || isNaN(cleaned)) {
      return new Decimal(0);
    }
    
    return new Decimal(cleaned);
  }
  
  return new Decimal(0);
}

/**
 * Compute capital gains based on input payload
 * @param {Object} payload - Input data containing asset details
 * @returns {Object} - Computed capital gains result
 */
function computeCapitalGains(payload) {
  try {
    const {
      assetType = '',
      purchaseDate = '',
      saleDate = '',
      purchasePrice = 0,
      salePrice = 0,
      indexationBenefit = false,
      expenses = 0
    } = payload;

    // Parse monetary values
    const purchasePriceDec = parseMoney(purchasePrice);
    const salePriceDec = parseMoney(salePrice);
    const expensesDec = parseMoney(expenses);

    // Calculate basic capital gain
    const capitalGain = salePriceDec.minus(purchasePriceDec).minus(expensesDec);

    // Determine if it's long-term or short-term based on holding period
    const purchaseDateObj = new Date(purchaseDate);
    const saleDateObj = new Date(saleDate);
    const holdingPeriodDays = Math.floor((saleDateObj - purchaseDateObj) / (1000 * 60 * 60 * 24));
    
    // For most assets, >365 days = long-term, for equity shares >365 days
    const isLongTerm = holdingPeriodDays > 365;
    
    // Apply indexation if applicable (only for long-term non-equity assets)
    let indexedPurchasePrice = purchasePriceDec;
    if (indexationBenefit && isLongTerm && assetType !== 'equity') {
      // Simplified indexation - in real scenario, would use CII (Cost Inflation Index)
      // For demo purposes, assuming 5% annual inflation
      const years = holdingPeriodDays / 365;
      const indexationFactor = new Decimal(1.05).pow(years);
      indexedPurchasePrice = purchasePriceDec.times(indexationFactor);
    }

    const indexedCapitalGain = salePriceDec.minus(indexedPurchasePrice).minus(expensesDec);
    const finalCapitalGain = indexationBenefit ? indexedCapitalGain : capitalGain;

    // Calculate tax liability
    let taxRate = new Decimal(0);
    if (isLongTerm) {
      if (assetType === 'equity') {
        taxRate = new Decimal(0.10); // 10% LTCG on equity above ₹1 lakh
      } else {
        taxRate = new Decimal(0.20); // 20% LTCG on other assets with indexation
      }
    } else {
      // Short-term gains taxed as per income tax slab - assuming 30% for demo
      taxRate = new Decimal(0.30);
    }

    const taxLiability = finalCapitalGain.greaterThan(0) ? finalCapitalGain.times(taxRate) : new Decimal(0);

    return {
      assetType,
      purchaseDate,
      saleDate,
      holdingPeriodDays,
      isLongTerm,
      purchasePrice: purchasePriceDec.toNumber(),
      salePrice: salePriceDec.toNumber(),
      expenses: expensesDec.toNumber(),
      capitalGain: capitalGain.toNumber(),
      indexedCapitalGain: indexedCapitalGain.toNumber(),
      finalCapitalGain: finalCapitalGain.toNumber(),
      taxRate: taxRate.toNumber(),
      taxLiability: taxLiability.toNumber(),
      indexationApplied: indexationBenefit && isLongTerm && assetType !== 'equity'
    };
  } catch (error) {
    throw new Error(`Capital gains calculation failed: ${error.message}`);
  }
}

module.exports = {
  parseMoney,
  computeCapitalGains
};
