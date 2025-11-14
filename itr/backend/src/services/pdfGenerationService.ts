import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export interface TaxReceiptData {
  userId: string;
  userName: string;
  pan: string;
  financialYear: string;
  assessmentYear: string;
  regime: 'OLD' | 'NEW';
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  totalTax: number;
  rebate: number;
  cess: number;
  surcharge: number;
  netTax: number;
  tdsDeducted: number;
  advanceTax: number;
  refundOrDue: number;
  calculationDate: Date;
  breakdown: {
    salaryIncome: number;
    housePropertyIncome: number;
    capitalGains: number;
    otherSources: number;
    businessIncome: number;
  };
  deductionBreakdown: {
    section80C: number;
    section80D: number;
    section80E: number;
    section80G: number;
    section80TTA: number;
    standardDeduction: number;
    otherDeductions: number;
  };
}

export class PDFGenerationService {
  
  /**
   * Generate HTML template for tax receipt
   */
  private static generateTaxReceiptHTML(data: TaxReceiptData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Calculation Receipt</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
                padding: 20px;
            }
            
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #16A34A, #06B6D4);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 30px;
            }
            
            .user-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #16A34A;
            }
            
            .user-info h2 {
                color: #16A34A;
                margin-bottom: 15px;
                font-size: 20px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .info-label {
                font-weight: 600;
                color: #495057;
            }
            
            .info-value {
                color: #212529;
                font-weight: 500;
            }
            
            .calculation-section {
                margin-bottom: 30px;
            }
            
            .section-title {
                background: #e9ecef;
                padding: 15px 20px;
                margin: 0 -30px 20px -30px;
                font-size: 18px;
                font-weight: bold;
                color: #495057;
                border-left: 4px solid #06B6D4;
            }
            
            .calculation-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .calculation-table th,
            .calculation-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            
            .calculation-table th {
                background: #f8f9fa;
                font-weight: 600;
                color: #495057;
            }
            
            .calculation-table .amount {
                text-align: right;
                font-weight: 500;
            }
            
            .total-row {
                background: #e8f5e8;
                font-weight: bold;
            }
            
            .total-row td {
                border-top: 2px solid #16A34A;
                color: #16A34A;
            }
            
            .summary-box {
                background: linear-gradient(135deg, #16A34A, #06B6D4);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin: 30px 0;
            }
            
            .summary-box h3 {
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .summary-amount {
                font-size: 36px;
                font-weight: bold;
                margin: 15px 0;
            }
            
            .regime-badge {
                display: inline-block;
                background: rgba(255,255,255,0.2);
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                margin-top: 10px;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
                border-top: 1px solid #dee2e6;
            }
            
            .disclaimer {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-size: 14px;
                color: #856404;
            }
            
            @media print {
                body { background: white; padding: 0; }
                .receipt-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h1>Tax Calculation Receipt</h1>
                <p>Comprehensive Income Tax Calculation Report</p>
            </div>
            
            <div class="content">
                <div class="user-info">
                    <h2>Taxpayer Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${data.userName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">PAN:</span>
                            <span class="info-value">${data.pan}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Financial Year:</span>
                            <span class="info-value">${data.financialYear}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Assessment Year:</span>
                            <span class="info-value">${data.assessmentYear}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tax Regime:</span>
                            <span class="info-value">${data.regime} Regime</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Calculation Date:</span>
                            <span class="info-value">${data.calculationDate.toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="calculation-section">
                    <div class="section-title">Income Breakdown</div>
                    <table class="calculation-table">
                        <thead>
                            <tr>
                                <th>Income Source</th>
                                <th class="amount">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Salary Income</td>
                                <td class="amount">${data.breakdown.salaryIncome.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>House Property Income</td>
                                <td class="amount">${data.breakdown.housePropertyIncome.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Capital Gains</td>
                                <td class="amount">${data.breakdown.capitalGains.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Other Sources</td>
                                <td class="amount">${data.breakdown.otherSources.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Business Income</td>
                                <td class="amount">${data.breakdown.businessIncome.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Gross Total Income</strong></td>
                                <td class="amount"><strong>₹${data.grossIncome.toLocaleString('en-IN')}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="calculation-section">
                    <div class="section-title">Deduction Breakdown</div>
                    <table class="calculation-table">
                        <thead>
                            <tr>
                                <th>Deduction Section</th>
                                <th class="amount">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Section 80C</td>
                                <td class="amount">${data.deductionBreakdown.section80C.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Section 80D</td>
                                <td class="amount">${data.deductionBreakdown.section80D.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Section 80E</td>
                                <td class="amount">${data.deductionBreakdown.section80E.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Section 80G</td>
                                <td class="amount">${data.deductionBreakdown.section80G.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Section 80TTA</td>
                                <td class="amount">${data.deductionBreakdown.section80TTA.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Standard Deduction</td>
                                <td class="amount">${data.deductionBreakdown.standardDeduction.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Other Deductions</td>
                                <td class="amount">${data.deductionBreakdown.otherDeductions.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Total Deductions</strong></td>
                                <td class="amount"><strong>₹${data.totalDeductions.toLocaleString('en-IN')}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="calculation-section">
                    <div class="section-title">Tax Calculation</div>
                    <table class="calculation-table">
                        <tbody>
                            <tr>
                                <td>Gross Total Income</td>
                                <td class="amount">₹${data.grossIncome.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Less: Total Deductions</td>
                                <td class="amount">₹${data.totalDeductions.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Taxable Income</strong></td>
                                <td class="amount"><strong>₹${data.taxableIncome.toLocaleString('en-IN')}</strong></td>
                            </tr>
                            <tr>
                                <td>Tax on Taxable Income</td>
                                <td class="amount">₹${data.totalTax.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Less: Rebate u/s 87A</td>
                                <td class="amount">₹${data.rebate.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Add: Surcharge</td>
                                <td class="amount">₹${data.surcharge.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Add: Health & Education Cess</td>
                                <td class="amount">₹${data.cess.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Total Tax Liability</strong></td>
                                <td class="amount"><strong>₹${data.netTax.toLocaleString('en-IN')}</strong></td>
                            </tr>
                            <tr>
                                <td>Less: TDS Deducted</td>
                                <td class="amount">₹${data.tdsDeducted.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td>Less: Advance Tax Paid</td>
                                <td class="amount">₹${data.advanceTax.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="summary-box">
                    <h3>${data.refundOrDue >= 0 ? 'Tax Refund Due' : 'Additional Tax Payable'}</h3>
                    <div class="summary-amount">₹${Math.abs(data.refundOrDue).toLocaleString('en-IN')}</div>
                    <div class="regime-badge">${data.regime} Tax Regime</div>
                </div>
                
                <div class="disclaimer">
                    <strong>Disclaimer:</strong> This is a computer-generated tax calculation receipt. 
                    The calculations are based on the information provided and current tax laws. 
                    Please consult a tax professional for accurate tax planning and filing.
                </div>
            </div>
            
            <div class="footer">
                <p>Generated on ${new Date().toLocaleString('en-IN')} | ITR Filing Platform</p>
                <p>This document is for reference purposes only and does not constitute official tax advice.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Generate PDF from tax calculation data
   */
  static async generateTaxReceiptPDF(data: TaxReceiptData): Promise<Buffer> {
    let browser;
    
    try {
      // Launch puppeteer browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set page format
      await page.setViewport({ width: 1200, height: 800 });
      
      // Generate HTML content
      const htmlContent = this.generateTaxReceiptHTML(data);
      
      // Set HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF receipt');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Save PDF to file system
   */
  static async savePDFToFile(pdfBuffer: Buffer, filename: string): Promise<string> {
    const uploadsDir = path.join(__dirname, '../../uploads/receipts');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);
    
    return filePath;
  }
}
