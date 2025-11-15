const request = require('supertest');
const { computeCapitalGains, parseMoney } = require('../calc/capitalGains');

// Mock the database module
jest.mock('../config/database', () => ({
  insertCapitalGains: jest.fn().mockReturnValue({ id: 1, created_at: '2024-01-01T00:00:00.000Z' })
}));

describe('Capital Gains Calculation', () => {
  describe('parseMoney function', () => {
    test('should parse currency strings correctly', () => {
      expect(parseMoney('₹1,00,000').toNumber()).toBe(100000);
      expect(parseMoney('$50,000').toNumber()).toBe(50000);
      expect(parseMoney('1,50,000').toNumber()).toBe(150000);
      expect(parseMoney('').toNumber()).toBe(0);
      expect(parseMoney(null).toNumber()).toBe(0);
      expect(parseMoney(undefined).toNumber()).toBe(0);
      expect(parseMoney(75000).toNumber()).toBe(75000);
    });
  });

  describe('computeCapitalGains function', () => {
    test('should calculate short-term capital gains correctly', () => {
      const payload = {
        assetType: 'equity',
        purchaseDate: '2023-01-01',
        saleDate: '2023-06-01',
        purchasePrice: '₹1,00,000',
        salePrice: '₹1,20,000',
        indexationBenefit: false,
        expenses: '₹2,000'
      };

      const result = computeCapitalGains(payload);

      expect(result.isLongTerm).toBe(false);
      expect(result.capitalGain).toBe(18000); // 120000 - 100000 - 2000
      expect(result.finalCapitalGain).toBe(18000);
      expect(result.taxRate).toBe(0.30); // Short-term rate
      expect(result.taxLiability).toBe(5400); // 18000 * 0.30
    });

    test('should calculate long-term capital gains for equity correctly', () => {
      const payload = {
        assetType: 'equity',
        purchaseDate: '2022-01-01',
        saleDate: '2023-06-01',
        purchasePrice: 100000,
        salePrice: 200000,
        indexationBenefit: false,
        expenses: 5000
      };

      const result = computeCapitalGains(payload);

      expect(result.isLongTerm).toBe(true);
      expect(result.capitalGain).toBe(95000); // 200000 - 100000 - 5000
      expect(result.finalCapitalGain).toBe(95000);
      expect(result.taxRate).toBe(0.10); // Long-term equity rate
      expect(result.taxLiability).toBe(9500); // 95000 * 0.10
      expect(result.indexationApplied).toBe(false); // No indexation for equity
    });

    test('should calculate long-term capital gains with indexation for non-equity assets', () => {
      const payload = {
        assetType: 'property',
        purchaseDate: '2020-01-01',
        saleDate: '2023-01-01',
        purchasePrice: 1000000,
        salePrice: 1500000,
        indexationBenefit: true,
        expenses: 50000
      };

      const result = computeCapitalGains(payload);

      expect(result.isLongTerm).toBe(true);
      expect(result.capitalGain).toBe(450000); // 1500000 - 1000000 - 50000
      expect(result.indexationApplied).toBe(true);
      expect(result.taxRate).toBe(0.20); // Long-term non-equity rate
      // Indexed capital gain should be less than regular capital gain due to indexation
      expect(result.indexedCapitalGain).toBeLessThan(result.capitalGain);
      expect(result.finalCapitalGain).toBe(result.indexedCapitalGain);
    });
  });
});

// Integration tests would require the actual Express app
// For now, we'll focus on the calculation logic tests above
