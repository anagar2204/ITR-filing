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

export interface TestUserProfile {
  id: string;
  name: string;
  age: number;
  pan: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
  expectedAccuracy: number;
  scenario: string;
}

export class TestUserController {
  
  /**
   * Generate comprehensive test user profiles
   */
  static generateTestUsers(): TestUserProfile[] {
    return [
      {
        id: 'test-user-1',
        name: 'Rajesh Kumar',
        age: 32,
        pan: 'ABCDE1234F',
        email: 'rajesh.kumar@email.com',
        phone: '+91-9876543210',
        address: 'Mumbai, Maharashtra',
        profession: 'Software Engineer',
        expectedAccuracy: 95,
        scenario: 'Young professional with moderate salary and basic investments'
      },
      {
        id: 'test-user-2',
        name: 'Priya Sharma',
        age: 45,
        pan: 'FGHIJ5678K',
        email: 'priya.sharma@email.com',
        phone: '+91-9876543211',
        address: 'Delhi, Delhi',
        profession: 'Senior Manager',
        expectedAccuracy: 97,
        scenario: 'Senior professional with high salary, house property, and maximum deductions'
      },
      {
        id: 'test-user-3',
        name: 'Suresh Patel',
        age: 65,
        pan: 'KLMNO9012P',
        email: 'suresh.patel@email.com',
        phone: '+91-9876543212',
        address: 'Ahmedabad, Gujarat',
        profession: 'Retired (Pension)',
        expectedAccuracy: 93,
        scenario: 'Senior citizen with pension, rental income, and senior citizen benefits'
      },
      {
        id: 'test-user-4',
        name: 'Anita Singh',
        age: 28,
        pan: 'PQRST3456U',
        email: 'anita.singh@email.com',
        phone: '+91-9876543213',
        address: 'Bangalore, Karnataka',
        profession: 'Consultant',
        expectedAccuracy: 94,
        scenario: 'Young professional with freelance income and minimal deductions'
      },
      {
        id: 'test-user-5',
        name: 'Vikram Gupta',
        age: 38,
        pan: 'UVWXY7890Z',
        email: 'vikram.gupta@email.com',
        phone: '+91-9876543214',
        address: 'Pune, Maharashtra',
        profession: 'Business Owner',
        expectedAccuracy: 96,
        scenario: 'Business owner with multiple income sources and complex deductions'
      }
    ];
  }

  /**
   * Create comprehensive test data for a user
   */
  async createTestUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const testUsers = TestUserController.generateTestUsers();
      const testUser = testUsers.find(u => u.id === userId);

      if (!testUser) {
        return res.status(404).json({
          success: false,
          message: 'Test user not found'
        });
      }

      // Clear existing data for this user
      this.clearUserData(userId);

      // Generate test data based on user profile
      const testData = this.generateTestDataForUser(testUser);

      // Insert test data
      await this.insertTestData(userId, testData);

      res.json({
        success: true,
        data: {
          profile: testUser,
          testData: testData,
          message: 'Test user data created successfully'
        }
      });

    } catch (error) {
      console.error('Create test user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Run complete test flow for a user
   */
  async runCompleteTest(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const testUsers = TestUserController.generateTestUsers();
      const testUser = testUsers.find(u => u.id === userId);

      if (!testUser) {
        return res.status(404).json({
          success: false,
          message: 'Test user not found'
        });
      }

      // Step 1: Create test data
      const testData = this.generateTestDataForUser(testUser);
      await this.insertTestData(userId, testData);

      // Step 2: Calculate tax summary
      const summaryResponse = await fetch(`http://localhost:5000/api/tax-calculation/simple-summary?userId=${userId}&financialYear=2024-25`);
      const summaryData = await summaryResponse.json() as any;

      // Step 3: Validate accuracy
      const accuracyResults = this.validateAccuracy(testUser, summaryData.data, testData);

      res.json({
        success: true,
        data: {
          profile: testUser,
          testData: testData,
          summary: summaryData.data,
          accuracy: accuracyResults,
          passed: accuracyResults.overallAccuracy >= testUser.expectedAccuracy
        }
      });

    } catch (error) {
      console.error('Complete test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to run complete test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clear existing user data
   */
  private clearUserData(userId: string) {
    salaryIncomes.delete(userId);
    interestIncomes.delete(userId);
    capitalGainsData.delete(userId);
    houseProperties.delete(userId);
    otherIncomes.delete(userId);
    section80CDeductions.delete(userId);
    section80DDeductions.delete(userId);
    taxesPaidTDSTCS.delete(userId);
    otherDeductions.delete(userId);
  }

  /**
   * Generate test data based on user profile
   */
  private generateTestDataForUser(user: TestUserProfile) {
    const baseData = {
      salary: this.generateSalaryData(user),
      deductions: this.generateDeductionData(user),
      otherIncome: this.generateOtherIncomeData(user),
      taxesPaid: this.generateTaxesPaidData(user)
    };

    return baseData;
  }

  /**
   * Generate salary data based on user profile
   */
  private generateSalaryData(user: TestUserProfile) {
    const salaryMultipliers = {
      'Software Engineer': 1.0,
      'Senior Manager': 1.8,
      'Retired (Pension)': 0.4,
      'Consultant': 0.9,
      'Business Owner': 2.2
    };

    const baseSalary = 800000 * (salaryMultipliers[user.profession] || 1.0);
    
    return {
      employerName: `${user.profession} Corp`,
      employerPAN: 'ABCDE1234F',
      employerTAN: 'BLRT12345A',
      grossSalary: Math.round(baseSalary * 1.4),
      basicSalary: Math.round(baseSalary),
      hra: Math.round(baseSalary * 0.3),
      lta: Math.round(baseSalary * 0.05),
      specialAllowance: Math.round(baseSalary * 0.1),
      otherAllowances: Math.round(baseSalary * 0.05),
      professionalTax: 2400,
      tds: Math.round(baseSalary * 0.1),
      form16Available: true,
      exemptAllowances: {
        hraExempt: Math.round(baseSalary * 0.15),
        ltaExempt: Math.round(baseSalary * 0.05),
        otherExempt: 0
      },
      standardDeduction: 75000,
      entertainmentAllowance: 0
    };
  }

  /**
   * Generate deduction data based on user profile
   */
  private generateDeductionData(user: TestUserProfile) {
    const deductionLevels = {
      'Software Engineer': 0.7,
      'Senior Manager': 1.0,
      'Retired (Pension)': 0.4,
      'Consultant': 0.6,
      'Business Owner': 0.9
    };

    const level = deductionLevels[user.profession] || 0.7;
    
    return {
      section80C: {
        lifeInsurancePremium: Math.round(80000 * level),
        epfContribution: Math.round(144000 * level),
        ppfContribution: Math.round(50000 * level),
        elssInvestment: Math.round(30000 * level),
        nscInvestment: 0,
        sukanyaSamriddhiYojana: user.age < 40 ? Math.round(25000 * level) : 0,
        homeLoanPrincipal: user.age > 30 ? Math.round(100000 * level) : 0,
        tuitionFees: user.age > 35 ? Math.round(40000 * level) : 0
      },
      section80D: {
        selfFamilyPremium: Math.round(25000 * level),
        parentsPremium: user.age > 35 ? Math.round((user.age > 60 ? 50000 : 30000) * level) : 0,
        selfFamilyPreventiveCheckup: Math.round(5000 * level),
        parentsPreventiveCheckup: user.age > 35 ? Math.round(5000 * level) : 0
      },
      otherDeductions: {
        section80E: user.age < 35 ? Math.round(50000 * level) : 0,
        section80G: Math.round(25000 * level),
        section80TTA: Math.round(10000 * level),
        section80TTB: user.age >= 60 ? Math.round(50000 * level) : 0
      }
    };
  }

  /**
   * Generate other income data
   */
  private generateOtherIncomeData(user: TestUserProfile) {
    const incomeMultipliers = {
      'Software Engineer': 0.3,
      'Senior Manager': 0.8,
      'Retired (Pension)': 1.2,
      'Consultant': 0.5,
      'Business Owner': 1.5
    };

    const multiplier = incomeMultipliers[user.profession] || 0.5;

    return {
      interestIncome: Math.round(30000 * multiplier),
      rentalIncome: user.age > 40 ? Math.round(200000 * multiplier) : 0,
      capitalGains: user.profession === 'Business Owner' ? Math.round(100000 * multiplier) : 0
    };
  }

  /**
   * Generate taxes paid data
   */
  private generateTaxesPaidData(user: TestUserProfile) {
    const salaryData = this.generateSalaryData(user);
    
    return {
      salaryTDS: salaryData.tds,
      otherTDS: Math.round(salaryData.tds * 0.2),
      advanceTax: user.profession === 'Business Owner' ? Math.round(salaryData.tds * 0.5) : 0,
      selfAssessmentTax: 0
    };
  }

  /**
   * Insert test data into storage
   */
  private async insertTestData(userId: string, testData: any) {
    // Insert salary data
    const salaryData = {
      id: Date.now().toString(),
      userId,
      ...testData.salary,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    salaryIncomes.set(userId, [salaryData]);

    // Insert Section 80C deductions
    section80CDeductions.set(userId, {
      id: Date.now().toString(),
      userId,
      ...testData.deductions.section80C,
      maxLimit: 150000,
      additionalNPSLimit: 50000,
      section80CCD1B: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert Section 80D deductions
    section80DDeductions.set(userId, {
      id: Date.now().toString(),
      userId,
      ...testData.deductions.section80D,
      selfAge: 'below60',
      spouseAge: 'below60',
      parentsAge: 'above60',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert other deductions if any
    if (Object.values(testData.deductions.otherDeductions).some(val => (val as number) > 0)) {
      otherDeductions.set(userId, {
        id: Date.now().toString(),
        userId,
        ...testData.deductions.otherDeductions,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert interest income if any
    if (testData.otherIncome.interestIncome > 0) {
      interestIncomes.set(userId, [{
        id: Date.now().toString(),
        userId,
        savingsAccountInterest: testData.otherIncome.interestIncome,
        fixedDepositInterest: 0,
        recurringDepositInterest: 0,
        bondInterest: 0,
        otherInterest: 0,
        tdsOnInterest: Math.round(testData.otherIncome.interestIncome * 0.1),
        bankDetails: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }

    // Insert taxes paid data
    taxesPaidTDSTCS.set(userId, {
      id: Date.now().toString(),
      userId,
      ...testData.taxesPaid,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
  }

  /**
   * Validate calculation accuracy with ultra-precision
   */
  private validateAccuracy(user: TestUserProfile, summary: any, testData: any) {
    const validations = [];
    let totalScore = 0;
    let maxScore = 0;

    // Validate gross income calculation
    const expectedGrossIncome = testData.salary.grossSalary - testData.salary.exemptAllowances.hraExempt;
    const actualGrossIncome = summary?.oldRegime?.grossTotalIncome || 0;
    const incomeAccuracy = this.calculateAccuracy(expectedGrossIncome, actualGrossIncome);
    validations.push({
      test: 'Gross Income Calculation',
      expected: expectedGrossIncome,
      actual: actualGrossIncome,
      accuracy: incomeAccuracy,
      passed: incomeAccuracy >= 95
    });
    totalScore += incomeAccuracy;
    maxScore += 100;

    // Validate deduction calculation
    const expectedDeductions = Math.min(
      testData.deductions.section80C.lifeInsurancePremium + 
      testData.deductions.section80C.epfContribution + 
      testData.deductions.section80C.ppfContribution,
      150000
    ) + testData.deductions.section80D.selfFamilyPremium + testData.deductions.section80D.parentsPremium;
    
    const actualDeductions = summary?.oldRegime?.totalDeductions || 0;
    const deductionAccuracy = this.calculateAccuracy(expectedDeductions, actualDeductions);
    validations.push({
      test: 'Deduction Calculation',
      expected: expectedDeductions,
      actual: actualDeductions,
      accuracy: deductionAccuracy,
      passed: deductionAccuracy >= 90
    });
    totalScore += deductionAccuracy;
    maxScore += 100;

    // Validate tax calculation logic
    const taxableIncome = Math.max(0, actualGrossIncome - actualDeductions);
    const actualTaxableIncome = summary?.oldRegime?.taxableIncome || 0;
    const taxableIncomeAccuracy = this.calculateAccuracy(taxableIncome, actualTaxableIncome);
    validations.push({
      test: 'Taxable Income Calculation',
      expected: taxableIncome,
      actual: actualTaxableIncome,
      accuracy: taxableIncomeAccuracy,
      passed: taxableIncomeAccuracy >= 98
    });
    totalScore += taxableIncomeAccuracy;
    maxScore += 100;

    const overallAccuracy = totalScore / maxScore * 100;

    return {
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      validations,
      passed: overallAccuracy >= user.expectedAccuracy,
      recommendations: this.generateRecommendations(validations, overallAccuracy)
    };
  }

  /**
   * Calculate accuracy percentage
   */
  private calculateAccuracy(expected: number, actual: number): number {
    if (expected === 0 && actual === 0) return 100;
    if (expected === 0) return actual === 0 ? 100 : 0;
    
    const difference = Math.abs(expected - actual);
    const accuracy = Math.max(0, 100 - (difference / expected) * 100);
    return Math.round(accuracy * 100) / 100;
  }

  /**
   * Generate recommendations based on accuracy results
   */
  private generateRecommendations(validations: any[], overallAccuracy: number): string[] {
    const recommendations = [];

    if (overallAccuracy < 90) {
      recommendations.push('Overall accuracy below 90%. Review calculation logic.');
    }

    validations.forEach(validation => {
      if (validation.accuracy < 95) {
        recommendations.push(`${validation.test} needs improvement (${validation.accuracy.toFixed(1)}% accuracy)`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All validations passed! System is working accurately.');
    }

    return recommendations;
  }

  /**
   * Get all test users
   */
  async getAllTestUsers(req: Request, res: Response) {
    try {
      const testUsers = TestUserController.generateTestUsers();
      
      res.json({
        success: true,
        data: testUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get test users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Run all test users
   */
  async runAllTests(req: Request, res: Response) {
    try {
      const testUsers = TestUserController.generateTestUsers();
      const results = [];

      for (const user of testUsers) {
        try {
          const testData = this.generateTestDataForUser(user);
          await this.insertTestData(user.id, testData);

          const summaryResponse = await fetch(`http://localhost:5000/api/tax-calculation/simple-summary?userId=${user.id}&financialYear=2024-25`);
          const summaryData = await summaryResponse.json() as any;

          const accuracyResults = this.validateAccuracy(user, summaryData.data, testData);

          results.push({
            user: user,
            accuracy: accuracyResults.overallAccuracy,
            passed: accuracyResults.passed,
            details: accuracyResults
          });
        } catch (error) {
          results.push({
            user: user,
            accuracy: 0,
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const overallAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
      const passedTests = results.filter(r => r.passed).length;

      res.json({
        success: true,
        data: {
          overallAccuracy: Math.round(overallAccuracy * 100) / 100,
          totalTests: results.length,
          passedTests,
          failedTests: results.length - passedTests,
          results,
          readyForEnhancement: overallAccuracy >= 90
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to run all tests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const testUserController = new TestUserController();
