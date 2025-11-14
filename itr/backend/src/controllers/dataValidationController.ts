import { Request, Response } from 'express';
import { 
  salaryIncomes, 
  interestIncomes, 
  capitalGainsData, 
  houseProperties, 
  otherIncomes 
} from './incomeSourceController';
import { 
  section80CDeductions,
  section80DDeductions,
  taxesPaidTDSTCS,
  otherDeductions
} from './taxSavingsController';

export class DataValidationController {

  /**
   * Get comprehensive data status for a user
   */
  async getDataStatus(req: Request, res: Response) {
    try {
      const { userId = 'default-user' } = req.query;

      const dataStatus = {
        userId: userId as string,
        timestamp: new Date().toISOString(),
        incomeData: {
          salary: {
            count: (salaryIncomes.get(userId as string) || []).length,
            data: salaryIncomes.get(userId as string) || [],
            hasData: (salaryIncomes.get(userId as string) || []).length > 0
          },
          interest: {
            count: (interestIncomes.get(userId as string) || []).length,
            data: interestIncomes.get(userId as string) || [],
            hasData: (interestIncomes.get(userId as string) || []).length > 0
          },
          capitalGains: {
            count: (capitalGainsData.get(userId as string) || []).length,
            data: capitalGainsData.get(userId as string) || [],
            hasData: (capitalGainsData.get(userId as string) || []).length > 0
          },
          houseProperty: {
            count: (houseProperties.get(userId as string) || []).length,
            data: houseProperties.get(userId as string) || [],
            hasData: (houseProperties.get(userId as string) || []).length > 0
          },
          otherIncome: {
            count: (otherIncomes.get(userId as string) || []).length,
            data: otherIncomes.get(userId as string) || [],
            hasData: (otherIncomes.get(userId as string) || []).length > 0
          }
        },
        deductionData: {
          section80C: {
            data: section80CDeductions.get(userId as string) || null,
            hasData: section80CDeductions.has(userId as string)
          },
          section80D: {
            data: section80DDeductions.get(userId as string) || null,
            hasData: section80DDeductions.has(userId as string)
          },
          otherDeductions: {
            data: otherDeductions.get(userId as string) || null,
            hasData: otherDeductions.has(userId as string)
          },
          taxesPaid: {
            data: taxesPaidTDSTCS.get(userId as string) || null,
            hasData: taxesPaidTDSTCS.has(userId as string)
          }
        },
        summary: {
          totalIncomeEntries: 0,
          totalDeductionEntries: 0,
          dataCompleteness: 0,
          missingData: []
        }
      };

      // Calculate summary
      const incomeEntries = Object.values(dataStatus.incomeData).reduce((sum, item) => sum + item.count, 0);
      const deductionEntries = Object.values(dataStatus.deductionData).filter(item => item.hasData).length;
      
      dataStatus.summary.totalIncomeEntries = incomeEntries;
      dataStatus.summary.totalDeductionEntries = deductionEntries;
      
      // Calculate completeness (out of 8 possible sections)
      const totalPossibleSections = 8;
      const completedSections = incomeEntries + deductionEntries;
      dataStatus.summary.dataCompleteness = Math.round((completedSections / totalPossibleSections) * 100);

      // Identify missing data
      const missingData = [];
      if (!dataStatus.incomeData.salary.hasData) missingData.push('Salary Income');
      if (!dataStatus.deductionData.section80C.hasData) missingData.push('Section 80C Deductions');
      if (!dataStatus.deductionData.section80D.hasData) missingData.push('Section 80D Health Insurance');
      if (!dataStatus.deductionData.taxesPaid.hasData) missingData.push('Taxes Paid/TDS');
      
      dataStatus.summary.missingData = missingData;

      res.json({
        success: true,
        data: dataStatus
      });

    } catch (error) {
      console.error('Data validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clear all data for a user (for testing)
   */
  async clearUserData(req: Request, res: Response) {
    try {
      const { userId = 'default-user' } = req.query;

      // Clear all data
      salaryIncomes.delete(userId as string);
      interestIncomes.delete(userId as string);
      capitalGainsData.delete(userId as string);
      houseProperties.delete(userId as string);
      otherIncomes.delete(userId as string);
      section80CDeductions.delete(userId as string);
      section80DDeductions.delete(userId as string);
      taxesPaidTDSTCS.delete(userId as string);
      otherDeductions.delete(userId as string);

      res.json({
        success: true,
        message: `All data cleared for user: ${userId}`
      });

    } catch (error) {
      console.error('Clear data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add sample data for testing
   */
  async addSampleData(req: Request, res: Response) {
    try {
      const { userId = 'default-user' } = req.query;

      // Add sample salary data
      const sampleSalary = {
        id: Date.now().toString(),
        userId: userId as string,
        employerName: 'Sample Tech Corp',
        employerPAN: 'ABCDE1234F',
        employerTAN: 'BLRT12345A',
        grossSalary: 1200000,
        basicSalary: 800000,
        hra: 240000,
        lta: 25000,
        specialAllowance: 80000,
        otherAllowances: 55000,
        professionalTax: 2400,
        tds: 120000,
        form16Available: true,
        exemptAllowances: {
          hraExempt: 120000,
          ltaExempt: 25000,
          otherExempt: 0
        },
        standardDeduction: 75000,
        entertainmentAllowance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      salaryIncomes.set(userId as string, [sampleSalary]);

      // Add sample Section 80C data
      const sample80C = {
        id: Date.now().toString(),
        userId: userId as string,
        lifeInsurancePremium: 80000,
        epfContribution: 96000,
        ppfContribution: 50000,
        elssInvestment: 24000,
        nscInvestment: 0,
        sukanyaSamriddhiYojana: 0,
        homeLoanPrincipal: 0,
        tuitionFees: 0,
        maxLimit: 150000,
        additionalNPSLimit: 50000,
        section80CCD1B: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      section80CDeductions.set(userId as string, sample80C as any);

      // Add sample Section 80D data
      const sample80D = {
        id: Date.now().toString(),
        userId: userId as string,
        selfFamilyPremium: 25000,
        parentsPremium: 50000,
        selfAge: 'below60' as const,
        spouseAge: 'below60' as const,
        parentsAge: 'above60' as const,
        selfFamilyPreventiveCheckup: 5000,
        parentsPreventiveCheckup: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      section80DDeductions.set(userId as string, sample80D as any);

      // Add sample taxes paid data
      const sampleTaxesPaid = {
        id: Date.now().toString(),
        userId: userId as string,
        salaryTDS: 120000,
        otherTDS: 5000,
        advanceTax: 0,
        selfAssessmentTax: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      taxesPaidTDSTCS.set(userId as string, sampleTaxesPaid as any);

      res.json({
        success: true,
        message: `Sample data added for user: ${userId}`,
        data: {
          salary: sampleSalary,
          section80C: sample80C,
          section80D: sample80D,
          taxesPaid: sampleTaxesPaid
        }
      });

    } catch (error) {
      console.error('Add sample data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add sample data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test data flow from input to summary
   */
  async testDataFlow(req: Request, res: Response) {
    try {
      const { userId = 'default-user' } = req.query;

      // Step 1: Add sample data
      await this.addSampleData(req, res);

      // Step 2: Get data status
      const dataStatusResponse = await fetch(`http://localhost:5000/api/data-validation/status?userId=${userId}`);
      const dataStatus = await dataStatusResponse.json() as any;

      // Step 3: Get tax summary
      const summaryResponse = await fetch(`http://localhost:5000/api/tax-calculation/simple-summary?userId=${userId}&financialYear=2024-25`);
      const summary = await summaryResponse.json() as any;

      res.json({
        success: true,
        message: 'Data flow test completed',
        data: {
          dataStatus: dataStatus.data,
          taxSummary: summary.data,
          flowWorking: summary.success && dataStatus.success
        }
      });

    } catch (error) {
      console.error('Test data flow error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test data flow',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const dataValidationController = new DataValidationController();
