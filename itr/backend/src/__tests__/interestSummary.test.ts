import request from 'supertest';
import express from 'express';
import interestSummaryRoutes from '../routes/interestSummary';

const app = express();
app.use(express.json());
app.use('/api/v1/interest-summary', interestSummaryRoutes);

describe('Interest Summary API', () => {
  test('computes correct totals for sample FY 2024-25 input', async () => {
    const payload = {
      fiscalYear: '2024-25',
      interest: { savings: 3500, fd: 12000, rd: 2000, bonds: 1500, other: 1000 },
      bankEntries: [
        { bankName: 'Bank A', interest: 8000, tdsDeducted: 2000 },
        { bankName: 'Bank B', interest: 7000, tdsDeducted: 1500 },
        { bankName: 'Bank C', interest: 5000, tdsDeducted: 1000 },
      ]
    };

    const res = await request(app).post('/api/v1/interest-summary').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.totalInterest).toBe(20000);
    expect(res.body.totalTDS).toBe(4500);
    expect(res.body.validation.interestMismatch).toBe(false);
  });

  test('detects mismatch when bank totals differ', async () => {
    const payload = {
      fiscalYear: '2024-25',
      interest: { savings: 1000, fd: 2000, rd: 0, bonds: 0, other: 0 }, // total 3000
      bankEntries: [
        { bankName: 'Bank X', interest: 1500, tdsDeducted: 100 },
        { bankName: 'Bank Y', interest: 2500, tdsDeducted: 150 } // bank sum 4000
      ]
    };
    const res = await request(app).post('/api/v1/interest-summary').send(payload);
    expect(res.body.totalInterest).toBe(3000);
    expect(res.body.validation.bankInterestSum).toBe(4000);
    expect(res.body.validation.interestMismatch).toBe(true);
  });

  test('handles string values with currency symbols', async () => {
    const payload = {
      fiscalYear: '2024-25',
      interest: { savings: '₹1,500', fd: '₹2,500.50', rd: 0, bonds: 0, other: 0 },
      bankEntries: [
        { bankName: 'Bank Z', interest: '₹4,000', tdsDeducted: '₹200' }
      ]
    };
    const res = await request(app).post('/api/v1/interest-summary').send(payload);
    expect(res.body.totalInterest).toBe(4000); // 1500 + 2500 (rounded)
    expect(res.body.totalTDS).toBe(200);
  });

  test('handles missing or null values gracefully', async () => {
    const payload = {
      fiscalYear: '2024-25',
      interest: { savings: 1000, fd: null, rd: undefined, bonds: 0, other: '' },
      bankEntries: [
        { bankName: 'Bank Test', interest: 1000, tdsDeducted: null }
      ]
    };
    const res = await request(app).post('/api/v1/interest-summary').send(payload);
    expect(res.body.totalInterest).toBe(1000);
    expect(res.body.totalTDS).toBe(0);
  });

  test('returns correct breakdown structure', async () => {
    const payload = {
      fiscalYear: '2024-25',
      interest: { savings: 1000, fd: 2000, rd: 500, bonds: 300, other: 200 },
      bankEntries: [
        { bankName: 'Test Bank', interest: 4000, tdsDeducted: 400 }
      ]
    };
    const res = await request(app).post('/api/v1/interest-summary').send(payload);
    
    expect(res.body.breakdown.categoryInterest).toEqual({
      savings: 1000,
      fd: 2000,
      rd: 500,
      bonds: 300,
      other: 200
    });
    
    expect(res.body.breakdown.bankSummary).toEqual([
      { bankName: 'Test Bank', interest: 4000, tdsDeducted: 400 }
    ]);
    
    expect(res.body.validation).toHaveProperty('bankInterestSum');
    expect(res.body.validation).toHaveProperty('categoryInterestSum');
    expect(res.body.validation).toHaveProperty('interestMismatch');
  });
});
