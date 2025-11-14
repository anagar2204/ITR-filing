import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { 
  SalaryIncome, 
  InterestIncome, 
  CapitalGains, 
  HouseProperty, 
  CryptoVDAIncome, 
  OtherIncome,
  IncomeSourceSummary 
} from '../models/incomeSource';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with actual database in production)
const salaryIncomes: Map<string, SalaryIncome[]> = new Map();
const interestIncomes: Map<string, InterestIncome[]> = new Map();
const capitalGainsData: Map<string, CapitalGains[]> = new Map();
const houseProperties: Map<string, HouseProperty[]> = new Map();
const cryptoVDAIncomes: Map<string, CryptoVDAIncome[]> = new Map();
const otherIncomes: Map<string, OtherIncome[]> = new Map();

export class IncomeSourceController {
  // Salary Income Methods
  static async createSalaryIncome(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default-user';
      const salaryData: SalaryIncome = {
        id: uuidv4(),
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!salaryIncomes.has(userId)) {
        salaryIncomes.set(userId, []);
      }
      salaryIncomes.get(userId)!.push(salaryData);

      logger.info(`Salary income created for user ${userId}`);
      res.status(201).json({ success: true, data: salaryData });
    } catch (error) {
      logger.error('Error creating salary income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getSalaryIncome(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      const userSalaryIncomes = salaryIncomes.get(userId) || [];
      
      res.json({ success: true, data: userSalaryIncomes });
    } catch (error) {
      logger.error('Error fetching salary income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async updateSalaryIncome(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 'default-user';
      const userSalaryIncomes = salaryIncomes.get(userId) || [];
      
      const index = userSalaryIncomes.findIndex(income => income.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Salary income not found' });
      }

      userSalaryIncomes[index] = {
        ...userSalaryIncomes[index],
        ...req.body,
        updatedAt: new Date()
      };

      res.json({ success: true, data: userSalaryIncomes[index] });
    } catch (error) {
      logger.error('Error updating salary income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Interest Income Methods
  static async createInterestIncome(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default-user';
      const interestData: InterestIncome = {
        id: uuidv4(),
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!interestIncomes.has(userId)) {
        interestIncomes.set(userId, []);
      }
      interestIncomes.get(userId)!.push(interestData);

      logger.info(`Interest income created for user ${userId}`);
      res.status(201).json({ success: true, data: interestData });
    } catch (error) {
      logger.error('Error creating interest income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getInterestIncome(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      const userInterestIncomes = interestIncomes.get(userId) || [];
      
      res.json({ success: true, data: userInterestIncomes });
    } catch (error) {
      logger.error('Error fetching interest income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Capital Gains Methods
  static async createCapitalGains(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default-user';
      const capitalGainsEntry: CapitalGains = {
        id: uuidv4(),
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!capitalGainsData.has(userId)) {
        capitalGainsData.set(userId, []);
      }
      capitalGainsData.get(userId)!.push(capitalGainsEntry);

      logger.info(`Capital gains created for user ${userId}`);
      res.status(201).json({ success: true, data: capitalGainsEntry });
    } catch (error) {
      logger.error('Error creating capital gains:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getCapitalGains(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      const userCapitalGains = capitalGainsData.get(userId) || [];
      
      res.json({ success: true, data: userCapitalGains });
    } catch (error) {
      logger.error('Error fetching capital gains:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // House Property Methods
  static async createHouseProperty(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default-user';
      const propertyData: HouseProperty = {
        id: uuidv4(),
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!houseProperties.has(userId)) {
        houseProperties.set(userId, []);
      }
      houseProperties.get(userId)!.push(propertyData);

      logger.info(`House property created for user ${userId}`);
      res.status(201).json({ success: true, data: propertyData });
    } catch (error) {
      logger.error('Error creating house property:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getHouseProperty(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      const userProperties = houseProperties.get(userId) || [];
      
      res.json({ success: true, data: userProperties });
    } catch (error) {
      logger.error('Error fetching house property:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Crypto/VDA Income Methods
  static async createCryptoVDAIncome(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default-user';
      const cryptoData: CryptoVDAIncome = {
        id: uuidv4(),
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!cryptoVDAIncomes.has(userId)) {
        cryptoVDAIncomes.set(userId, []);
      }
      cryptoVDAIncomes.get(userId)!.push(cryptoData);

      logger.info(`Crypto/VDA income created for user ${userId}`);
      res.status(201).json({ success: true, data: cryptoData });
    } catch (error) {
      logger.error('Error creating crypto/VDA income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getCryptoVDAIncome(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      const userCryptoIncomes = cryptoVDAIncomes.get(userId) || [];
      
      res.json({ success: true, data: userCryptoIncomes });
    } catch (error) {
      logger.error('Error fetching crypto/VDA income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Other Income Methods
  static async createOtherIncome(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default-user';
      const otherIncomeData: OtherIncome = {
        id: uuidv4(),
        userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!otherIncomes.has(userId)) {
        otherIncomes.set(userId, []);
      }
      otherIncomes.get(userId)!.push(otherIncomeData);

      logger.info(`Other income created for user ${userId}`);
      res.status(201).json({ success: true, data: otherIncomeData });
    } catch (error) {
      logger.error('Error creating other income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getOtherIncome(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      const userOtherIncomes = otherIncomes.get(userId) || [];
      
      res.json({ success: true, data: userOtherIncomes });
    } catch (error) {
      logger.error('Error fetching other income:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Summary Methods
  static async getIncomeSourceSummary(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default-user';
      
      const summary: IncomeSourceSummary = {
        userId,
        salaryIncome: salaryIncomes.get(userId)?.[0],
        interestIncome: interestIncomes.get(userId)?.[0],
        capitalGains: capitalGainsData.get(userId)?.[0],
        houseProperty: houseProperties.get(userId)?.[0],
        cryptoVDAIncome: cryptoVDAIncomes.get(userId)?.[0],
        otherIncome: otherIncomes.get(userId)?.[0],
        totalGrossIncome: 0,
        totalTaxableIncome: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      let totalGross = 0;
      if (summary.salaryIncome) totalGross += summary.salaryIncome.grossSalary;
      if (summary.interestIncome) {
        totalGross += summary.interestIncome.savingsAccountInterest + 
                     summary.interestIncome.fixedDepositInterest + 
                     summary.interestIncome.otherInterest;
      }
      if (summary.capitalGains) {
        totalGross += summary.capitalGains.shortTermGains.totalGains + 
                     summary.capitalGains.longTermGains.totalGains;
      }
      if (summary.houseProperty) {
        totalGross += summary.houseProperty.properties.reduce((sum, prop) => sum + prop.rentReceived, 0);
      }
      if (summary.cryptoVDAIncome) totalGross += summary.cryptoVDAIncome.totalGains;
      if (summary.otherIncome) {
        totalGross += summary.otherIncome.dividendIncome + 
                     summary.otherIncome.winningsFromLottery + 
                     summary.otherIncome.otherSources.reduce((sum, source) => sum + source.amount, 0);
      }

      summary.totalGrossIncome = totalGross;
      summary.totalTaxableIncome = totalGross; // Simplified calculation

      res.json({ success: true, data: summary });
    } catch (error) {
      logger.error('Error fetching income source summary:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const incomeSourceController = new IncomeSourceController();

// Export storage objects for tax calculation integration
export { 
  salaryIncomes, 
  interestIncomes, 
  capitalGainsData, 
  houseProperties, 
  cryptoVDAIncomes, 
  otherIncomes 
};
