import { Request, Response } from 'express';
import { 
  Section80CDeduction, 
  Section80DDeduction, 
  TaxesPaidTDSTCS, 
  CarryForwardLosses, 
  OtherDeductions,
  TaxSavingsSummary 
} from '../models/taxSavings';

// In-memory storage (replace with actual database)
const section80CStore = new Map<string, Section80CDeduction>();
const section80DStore = new Map<string, Section80DDeduction>();
const taxesPaidStore = new Map<string, TaxesPaidTDSTCS>();
const carryForwardLossesStore = new Map<string, CarryForwardLosses>();
const otherDeductionsStore = new Map<string, OtherDeductions>();

export class TaxSavingsController {
  
  // Section 80C Methods
  static async createSection80C(req: Request, res: Response) {
    try {
      const section80CData: Section80CDeduction = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate total deduction
      const totalInvestments = 
        section80CData.lifeInsurancePremium +
        section80CData.epfContribution +
        section80CData.vpfContribution +
        section80CData.ppfContribution +
        section80CData.elssInvestment +
        section80CData.nscInvestment +
        section80CData.taxSaverFD +
        section80CData.sukanyaSamriddhiYojana +
        section80CData.homeLoanPrincipal +
        section80CData.tuitionFees +
        section80CData.ulipPremium +
        section80CData.pensionFundContribution +
        section80CData.infrastructureBonds +
        section80CData.section80CCC +
        section80CData.section80CCD1;

      section80CData.totalDeduction = Math.min(totalInvestments, section80CData.maxLimit || 150000);
      
      section80CStore.set(section80CData.userId, section80CData);
      
      res.status(201).json({
        success: true,
        data: section80CData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating Section 80C data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSection80C(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const section80CData = section80CStore.get(userId as string);
      
      if (!section80CData) {
        return res.status(404).json({
          success: false,
          message: 'Section 80C data not found'
        });
      }
      
      res.json({
        success: true,
        data: section80CData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching Section 80C data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Section 80D Methods
  static async createSection80D(req: Request, res: Response) {
    try {
      const section80DData: Section80DDeduction = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate limits based on age
      const selfFamilyLimit = (section80DData.selfAge === 'above60' || section80DData.spouseAge === 'above60') ? 50000 : 25000;
      const parentsLimit = section80DData.parentsAge === 'above60' ? 50000 : 25000;

      section80DData.selfFamilyLimit = selfFamilyLimit;
      section80DData.parentsLimit = parentsLimit;

      // Calculate total deduction
      const selfFamilyTotal = Math.min(
        section80DData.selfFamilyPremium + section80DData.selfFamilyPreventiveCheckup + section80DData.selfFamilyMedicalExpenses,
        selfFamilyLimit
      );
      
      const parentsTotal = Math.min(
        section80DData.parentsPremium + section80DData.parentsPreventiveCheckup + section80DData.parentsMedicalExpenses,
        parentsLimit
      );

      section80DData.totalDeduction = selfFamilyTotal + parentsTotal + section80DData.cghsContribution;
      
      section80DStore.set(section80DData.userId, section80DData);
      
      res.status(201).json({
        success: true,
        data: section80DData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating Section 80D data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSection80D(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const section80DData = section80DStore.get(userId as string);
      
      if (!section80DData) {
        return res.status(404).json({
          success: false,
          message: 'Section 80D data not found'
        });
      }
      
      res.json({
        success: true,
        data: section80DData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching Section 80D data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Taxes Paid (TDS/TCS) Methods
  static async createTaxesPaid(req: Request, res: Response) {
    try {
      const taxesPaidData: TaxesPaidTDSTCS = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      taxesPaidData.totalTDSClaimed = 
        taxesPaidData.tdsOnSalary +
        taxesPaidData.tdsOnInterest +
        taxesPaidData.tdsOnDividend +
        taxesPaidData.tdsOnRent +
        taxesPaidData.tdsOnProfessionalFees +
        taxesPaidData.tdsOnCommission +
        taxesPaidData.tdsOnOthers;

      taxesPaidData.totalTCSClaimed = 
        taxesPaidData.tcsOnSaleOfGoods +
        taxesPaidData.tcsOnForeignRemittance +
        taxesPaidData.tcsOnMotorVehicle +
        taxesPaidData.tcsOnOthers;

      taxesPaidData.totalAdvanceTax = 
        taxesPaidData.advanceTaxPaid + taxesPaidData.selfAssessmentTax;
      
      taxesPaidStore.set(taxesPaidData.userId, taxesPaidData);
      
      res.status(201).json({
        success: true,
        data: taxesPaidData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating taxes paid data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTaxesPaid(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const taxesPaidData = taxesPaidStore.get(userId as string);
      
      if (!taxesPaidData) {
        return res.status(404).json({
          success: false,
          message: 'Taxes paid data not found'
        });
      }
      
      res.json({
        success: true,
        data: taxesPaidData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching taxes paid data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Carry Forward Losses Methods
  static async createCarryForwardLosses(req: Request, res: Response) {
    try {
      const lossesData: CarryForwardLosses = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      carryForwardLossesStore.set(lossesData.userId, lossesData);
      
      res.status(201).json({
        success: true,
        data: lossesData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating carry forward losses data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCarryForwardLosses(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const lossesData = carryForwardLossesStore.get(userId as string);
      
      if (!lossesData) {
        return res.status(404).json({
          success: false,
          message: 'Carry forward losses data not found'
        });
      }
      
      res.json({
        success: true,
        data: lossesData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching carry forward losses data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Other Deductions Methods
  static async createOtherDeductions(req: Request, res: Response) {
    try {
      const otherDeductionsData: OtherDeductions = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate total other deductions
      otherDeductionsData.totalOtherDeductions = 
        otherDeductionsData.section80E.educationLoanInterest +
        (otherDeductionsData.section80G.donations100Percent + otherDeductionsData.section80G.donations50Percent * 0.5) +
        otherDeductionsData.section80GG.eligibleDeduction +
        otherDeductionsData.section80TTA.eligibleDeduction +
        otherDeductionsData.section80TTB.eligibleDeduction +
        otherDeductionsData.section24B.homeLoanInterest +
        otherDeductionsData.section80DD.deductionAmount +
        otherDeductionsData.section80DDB.medicalExpenses +
        otherDeductionsData.section80U.deductionAmount;
      
      otherDeductionsStore.set(otherDeductionsData.userId, otherDeductionsData);
      
      res.status(201).json({
        success: true,
        data: otherDeductionsData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating other deductions data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOtherDeductions(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const otherDeductionsData = otherDeductionsStore.get(userId as string);
      
      if (!otherDeductionsData) {
        return res.status(404).json({
          success: false,
          message: 'Other deductions data not found'
        });
      }
      
      res.json({
        success: true,
        data: otherDeductionsData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching other deductions data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Tax Savings Summary
  static async getTaxSavingsSummary(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      const section80C = section80CStore.get(userId as string);
      const section80D = section80DStore.get(userId as string);
      const taxesPaid = taxesPaidStore.get(userId as string);
      const carryForwardLosses = carryForwardLossesStore.get(userId as string);
      const otherDeductions = otherDeductionsStore.get(userId as string);

      const totalDeductions = 
        (section80C?.totalDeduction || 0) +
        (section80C?.section80CCD1B || 0) + // Additional NPS deduction
        (section80D?.totalDeduction || 0) +
        (otherDeductions?.totalOtherDeductions || 0);

      const totalTaxesPaid = 
        (taxesPaid?.totalTDSClaimed || 0) +
        (taxesPaid?.totalTCSClaimed || 0) +
        (taxesPaid?.totalAdvanceTax || 0);

      const summary: TaxSavingsSummary = {
        userId: userId as string,
        section80C,
        section80D,
        taxesPaid,
        carryForwardLosses,
        otherDeductions,
        totalDeductions,
        totalTaxesPaid,
        netTaxLiability: 0, // This would be calculated based on income and tax computation
        refundDue: 0,
        additionalTaxDue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tax savings summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update methods
  static async updateSection80C(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      const existingData = section80CStore.get(userId);
      if (!existingData) {
        return res.status(404).json({
          success: false,
          message: 'Section 80C data not found'
        });
      }

      const updatedData: Section80CDeduction = {
        ...existingData,
        ...req.body,
        updatedAt: new Date()
      };

      // Recalculate total deduction
      const totalInvestments = 
        updatedData.lifeInsurancePremium +
        updatedData.epfContribution +
        updatedData.vpfContribution +
        updatedData.ppfContribution +
        updatedData.elssInvestment +
        updatedData.nscInvestment +
        updatedData.taxSaverFD +
        updatedData.sukanyaSamriddhiYojana +
        updatedData.homeLoanPrincipal +
        updatedData.tuitionFees +
        updatedData.ulipPremium +
        updatedData.pensionFundContribution +
        updatedData.infrastructureBonds +
        updatedData.section80CCC +
        updatedData.section80CCD1;

      updatedData.totalDeduction = Math.min(totalInvestments, updatedData.maxLimit || 150000);
      
      section80CStore.set(userId, updatedData);
      
      res.json({
        success: true,
        data: updatedData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating Section 80C data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const taxSavingsController = new TaxSavingsController();

// Export storage objects for tax calculation integration
export { 
  section80CStore as section80CDeductions,
  section80DStore as section80DDeductions,
  taxesPaidStore as taxesPaidTDSTCS,
  carryForwardLossesStore as carryForwardLosses,
  otherDeductionsStore as otherDeductions
};
