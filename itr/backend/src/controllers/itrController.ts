import { Request, Response } from 'express';
import { taxEngine, TaxCalculationInput } from '../services/taxEngine';

// In-memory storage (replace with database in production)
const userData: Record<string, any> = {};
const taxAudits: Record<string, any> = {};
const itrData = new Map<string, any>();

export const savePersonalInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const personalInfo = req.body

    // Validate required fields
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.pan) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Save to storage
    const existingData = itrData.get(userId) || {}
    itrData.set(userId, {
      ...existingData,
      personalInfo,
      step: 1,
      updatedAt: new Date()
    })

    res.json({
      success: true,
      message: 'Personal information saved successfully',
      data: { step: 1 }
    })
  } catch (error) {
    console.error('Error saving personal info:', error)
    res.status(500).json({ error: 'Failed to save personal information' })
  }
}

export const saveIncomeSources = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const incomeSources = req.body

    const existingData = itrData.get(userId) || {}
    itrData.set(userId, {
      ...existingData,
      incomeSources,
      step: 2,
      updatedAt: new Date()
    })

    res.json({
      success: true,
      message: 'Income sources saved successfully',
      data: { step: 2 }
    })
  } catch (error) {
    console.error('Error saving income sources:', error)
    res.status(500).json({ error: 'Failed to save income sources' })
  }
}

export const saveTaxSaving = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const taxSaving = req.body

    const existingData = itrData.get(userId) || {}
    itrData.set(userId, {
      ...existingData,
      taxSaving,
      step: 3,
      updatedAt: new Date()
    })

    res.json({
      success: true,
      message: 'Tax saving details saved successfully',
      data: { step: 3 }
    })
  } catch (error) {
    console.error('Error saving tax saving:', error)
    res.status(500).json({ error: 'Failed to save tax saving details' })
  }
}

export const getTaxSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const userData = itrData.get(userId)

    if (!userData) {
      return res.status(404).json({ error: 'No ITR data found' })
    }

    // Prepare input for tax engine
    const taxInput: TaxCalculationInput = {
      financialYear: 'FY2025-26',
      regime: 'new',
      ageGroup: '0-60',
      incomes: {
        salary: userData.incomeSources?.salary || 0,
        interest: userData.incomeSources?.interest || 0,
        rental: userData.incomeSources?.rental || 0,
        businessProfession: userData.incomeSources?.businessProfession || 0,
        capitalGains: userData.incomeSources?.capitalGains || 0,
        otherSources: userData.incomeSources?.otherSources || 0
      },
      deductions: userData.taxSaving?.deductions || {},
      tdsPaid: userData.taxSaving?.tdsPaid || 0,
      tcsPaid: userData.taxSaving?.tcsPaid || 0
    };

    // Calculate using tax engine
    const comparison = taxEngine.compareRegimes(taxInput);
    
    // Store audit trail
    const auditId = `AUDIT-${Date.now()}-${userId}`;
    taxAudits[auditId] = {
      userId,
      input: taxInput,
      result: comparison,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        auditId,
        newRegime: comparison.new,
        oldRegime: comparison.old,
        recommended: comparison.recommended,
        savings: comparison.savings
      }
    })
  } catch (error) {
    console.error('Error getting tax summary:', error)
    res.status(500).json({ error: 'Failed to get tax summary' })
  }
}

export const finalizeITR = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const userData = itrData.get(userId)

    if (!userData) {
      return res.status(404).json({ error: 'No ITR data found' })
    }

    // Mark as finalized
    itrData.set(userId, {
      ...userData,
      finalized: true,
      finalizedAt: new Date()
    })

    res.json({
      success: true,
      message: 'ITR finalized successfully',
      data: {
        itrType: 'ITR-1',
        acknowledgmentNumber: `ACK${Date.now()}`
      }
    })
  } catch (error) {
    console.error('Error finalizing ITR:', error)
    res.status(500).json({ error: 'Failed to finalize ITR' })
  }
}

// Get audit trail
export const getAuditTrail = async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    
    const audit = taxAudits[auditId];
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit record not found' });
    }
    
    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
};
