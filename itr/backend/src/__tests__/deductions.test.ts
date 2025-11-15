/**
 * Deductions Test Suite - Comprehensive Testing
 * Tests all deduction endpoints with exact expected values
 */

import request from 'supertest';
import createTestApp from './testApp';
import { Express } from 'express';

describe('Deductions API - Comprehensive Tests', () => {
  let app: Express;
  
  beforeAll(async () => {
    app = await createTestApp();
  });

  describe('Section 80C Deductions', () => {
    
    test('80C: Input components totaling ₹1,60,000 on AY where cap=₹1,50,000', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2025-26',
        idempotencyKey: 'k1',
        components: [
          { type: 'PPF', amount: '80000' },
          { type: 'ELSS', amount: '60000' },
          { type: 'HomeLoanPrincipal', amount: '20000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/80c')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total80c).toBe(150000); // Capped
      expect(response.body.capApplied).toBe(true);
      expect(response.body.savedComponents).toHaveLength(3);
    });

    test('80C: Idempotency - same key returns existing record', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2025-26',
        idempotencyKey: 'k1',
        components: [
          { type: 'PPF', amount: '80000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/80c')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total80c).toBe(150000); // Same as previous
      expect(response.body.capApplied).toBe(true);
    });

    test('80C: Validation error for invalid AY', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2023-24', // Invalid AY
        components: [
          { type: 'PPF', amount: '50000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/80c')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Section 80D Deductions', () => {
    
    test('80D: Premiums self ₹30,000 + parents (senior) ₹80,000', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2024-25',
        premiums: [
          { for: 'self', ageBracket: '<60', amount: '30000' },
          { for: 'parents', ageBracket: '60+', amount: '80000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/80d')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.capBreakdown.selfFamily.allowed).toBe(25000); // Self cap
      expect(response.body.capBreakdown.parents.allowed).toBe(50000); // Senior parents cap
      expect(response.body.total80d).toBe(75000); // 25000 + 50000
    });

    test('80D: Non-senior citizen caps', async () => {
      const payload = {
        userId: 'user-def',
        ay: '2024-25',
        premiums: [
          { for: 'self', ageBracket: '<60', amount: '30000' },
          { for: 'parents', ageBracket: '<60', amount: '30000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/80d')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.capBreakdown.selfFamily.allowed).toBe(25000);
      expect(response.body.capBreakdown.parents.allowed).toBe(25000);
      expect(response.body.total80d).toBe(50000);
    });
  });

  describe('Taxes Paid (TDS/TCS)', () => {
    
    test('Taxes Paid: Sample TDS entries totaling ₹66,499', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2025-26',
        tdsEntries: [
          { source: 'Salary', amount: '60000' },
          { source: 'Interest', amount: '6499' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/taxes-paid')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalTDS).toBe(66499);
      expect(response.body.entriesCount.tds).toBe(2);
    });

    test('Taxes Paid: With TCS entries', async () => {
      const payload = {
        userId: 'user-ghi',
        ay: '2025-26',
        tdsEntries: [
          { source: 'Salary', amount: '50000' }
        ],
        tcsEntries: [
          { source: 'Purchase', amount: '5000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/taxes-paid')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalTDS).toBe(50000);
      expect(response.body.totalTCS).toBe(5000);
      expect(response.body.entriesCount.tds).toBe(1);
      expect(response.body.entriesCount.tcs).toBe(1);
    });
  });

  describe('Carry Forward Losses', () => {
    
    test('Carry Forward: Business loss FY2019-20 amount ₹1,50,000', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2025-26',
        losses: [
          { lossType: 'Business', yearOfLoss: '2019-20', amount: '150000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/carry-forward')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.availableOffsets.Business).toBe(150000);
    });

    test('Carry Forward: Multiple loss types', async () => {
      const payload = {
        userId: 'user-jkl',
        ay: '2025-26',
        losses: [
          { lossType: 'STCL', yearOfLoss: '2022-23', amount: '50000' },
          { lossType: 'LTCL', yearOfLoss: '2021-22', amount: '75000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/carry-forward')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.availableOffsets.STCL).toBe(50000);
      expect(response.body.availableOffsets.LTCL).toBe(75000);
    });
  });

  describe('Other Deductions', () => {
    
    test('Other Deductions: 80E interest ₹40,000 + 80G donation ₹10,000', async () => {
      const payload = {
        userId: 'user-abc',
        ay: '2025-26',
        entries: [
          { section: '80E', amount: '40000' },
          { section: '80G', amount: '10000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/other')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sectionBreakdown['80E'].allowed).toBe(40000); // No cap
      expect(response.body.sectionBreakdown['80G'].allowed).toBe(10000);
      expect(response.body.totalOtherDeductions).toBe(50000);
    });

    test('Other Deductions: 80TTA with cap', async () => {
      const payload = {
        userId: 'user-mno',
        ay: '2024-25',
        entries: [
          { section: '80TTA', amount: '15000' } // Above cap
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/other')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sectionBreakdown['80TTA'].claimed).toBe(15000);
      expect(response.body.sectionBreakdown['80TTA'].allowed).toBe(10000); // Capped
      expect(response.body.totalOtherDeductions).toBe(10000);
    });
  });

  describe('Full Computation Integration', () => {
    
    test('Compute with deductions: Complete scenario', async () => {
      const userId = 'user-integration-test';
      const ay = '2025-26';

      // Save 80C deductions
      await request(app)
        .post('/api/v1/deductions/80c')
        .send({
          userId,
          ay,
          components: [
            { type: 'PPF', amount: '80000' },
            { type: 'ELSS', amount: '70000' }
          ]
        });

      // Save 80D deductions
      await request(app)
        .post('/api/v1/deductions/80d')
        .send({
          userId,
          ay,
          premiums: [
            { for: 'self', ageBracket: '<60', amount: '25000' }
          ]
        });

      // Save taxes paid
      await request(app)
        .post('/api/v1/deductions/taxes-paid')
        .send({
          userId,
          ay,
          tdsEntries: [
            { source: 'Additional TDS', amount: '10000' }
          ]
        });

      // Now compute tax with deductions (will work with zero income)
      const response = await request(app)
        .post('/api/v1/deductions/compute/with-deductions')
        .send({ userId, ay })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.deductionsBreakdown.section80C).toBe(150000); // Capped
      expect(response.body.data.deductionsBreakdown.section80D).toBe(25000);
      expect(response.body.data.finalComputation.taxAlreadyPaid).toBe(10000); // Only additional TDS
      expect(response.body.data.regimeComparison.recommended).toMatch(/^(old|new)$/);
      expect(response.body.runId).toBeDefined();
    });

    test('Compute: Cached result for same inputs', async () => {
      const userId = 'user-integration-test';
      const ay = '2025-26';

      const response = await request(app)
        .post('/api/v1/deductions/compute/with-deductions')
        .send({ userId, ay })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cached).toBe(true); // Should return cached result
    });

    test('Get saved computation by runId', async () => {
      const userId = 'user-saved-test';
      const ay = '2024-25';

      // First compute
      const computeResponse = await request(app)
        .post('/api/v1/deductions/compute/with-deductions')
        .send({ userId, ay })
        .expect(200);

      const runId = computeResponse.body.runId;

      // Get saved computation
      const response = await request(app)
        .get(`/api/v1/deductions/compute/saved/${runId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.runId).toBe(runId);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.assessmentYear).toBe(ay);
    });
  });

  describe('Edge Cases and Validation', () => {
    
    test('Zero/empty inputs should not error', async () => {
      const payload = {
        userId: 'user-zero',
        ay: '2024-25',
        components: []
      };

      const response = await request(app)
        .post('/api/v1/deductions/80c')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total80c).toBe(0);
      expect(response.body.capApplied).toBe(false);
    });

    test('Invalid section in other deductions', async () => {
      const payload = {
        userId: 'user-invalid',
        ay: '2024-25',
        entries: [
          { section: '80INVALID', amount: '10000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/other')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('Missing required fields', async () => {
      const payload = {
        ay: '2024-25',
        // Missing userId
        components: [
          { type: 'PPF', amount: '50000' }
        ]
      };

      const response = await request(app)
        .post('/api/v1/deductions/80c')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Database Persistence Tests', () => {
    
    test('Save and retrieve identical data', async () => {
      const userId = 'user-persistence';
      const ay = '2024-25';
      const idempotencyKey = 'persistence-test';

      const originalPayload = {
        userId,
        ay,
        idempotencyKey,
        components: [
          { type: 'PPF', amount: '100000' },
          { type: 'ELSS', amount: '50000' }
        ]
      };

      // Save data
      const saveResponse = await request(app)
        .post('/api/v1/deductions/80c')
        .send(originalPayload)
        .expect(200);

      // Retrieve with same idempotency key
      const retrieveResponse = await request(app)
        .post('/api/v1/deductions/80c')
        .send(originalPayload)
        .expect(200);

      expect(retrieveResponse.body.id).toBe(saveResponse.body.id);
      expect(retrieveResponse.body.total80c).toBe(saveResponse.body.total80c);
      expect(retrieveResponse.body.savedComponents).toEqual(saveResponse.body.savedComponents);
    });
  });
});
