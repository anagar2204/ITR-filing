/**
 * Document Parser Service
 * Parses Form 16 and other tax documents
 */

import pdfParse from 'pdf-parse';
import fs from 'fs';

export interface Form16Data {
  pan: string;
  employerName: string;
  employerTAN: string;
  financialYear: string;
  assessmentYear: string;
  grossSalary: number;
  standardDeduction: number;
  professionalTax: number;
  netSalary: number;
  tdsDeducted: number;
  deductions: {
    section80C?: number;
    section80D?: number;
    section80E?: number;
    hra?: number;
    lta?: number;
  };
  quarterlyTDS: Array<{
    quarter: string;
    amount: number;
  }>;
}

/**
 * Parse Form 16 PDF
 */
export async function parseForm16(filePath: string): Promise<Form16Data> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Extract data using regex patterns
    const data: Form16Data = {
      pan: extractPAN(text),
      employerName: extractEmployerName(text),
      employerTAN: extractTAN(text),
      financialYear: extractFinancialYear(text),
      assessmentYear: extractAssessmentYear(text),
      grossSalary: extractAmount(text, /gross\s*salary/i) || 0,
      standardDeduction: 50000, // Standard for FY 2024-25
      professionalTax: extractAmount(text, /professional\s*tax/i) || 0,
      netSalary: 0,
      tdsDeducted: extractAmount(text, /total\s*tax\s*deducted/i) || 0,
      deductions: extractDeductions(text),
      quarterlyTDS: extractQuarterlyTDS(text)
    };

    // Calculate net salary
    data.netSalary = data.grossSalary - data.standardDeduction - data.professionalTax;

    return data;
  } catch (error) {
    throw new Error(`Failed to parse Form 16: ${error.message}`);
  }
}

/**
 * Extract PAN from text
 */
function extractPAN(text: string): string {
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
  const matches = text.match(panRegex);
  return matches ? matches[0] : '';
}

/**
 * Extract TAN from text
 */
function extractTAN(text: string): string {
  const tanRegex = /\b[A-Z]{4}[0-9]{5}[A-Z]\b/g;
  const matches = text.match(tanRegex);
  return matches ? matches[0] : '';
}

/**
 * Extract employer name
 */
function extractEmployerName(text: string): string {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('employer') || lines[i].toLowerCase().includes('name of the employer')) {
      return lines[i + 1]?.trim() || '';
    }
  }
  return '';
}

/**
 * Extract financial year
 */
function extractFinancialYear(text: string): string {
  const fyRegex = /(\d{4})-(\d{2,4})/g;
  const matches = text.match(fyRegex);
  if (matches && matches.length > 0) {
    return matches[0];
  }
  return '2024-25';
}

/**
 * Extract assessment year
 */
function extractAssessmentYear(text: string): string {
  const fy = extractFinancialYear(text);
  if (fy) {
    const year = parseInt(fy.split('-')[0]);
    return `${year + 1}-${(year + 2).toString().slice(-2)}`;
  }
  return '2025-26';
}

/**
 * Extract amount from text based on pattern
 */
function extractAmount(text: string, pattern: RegExp): number | null {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      // Look for amount in same line or next few lines
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        const amountMatch = lines[j].match(/[\d,]+\.?\d*/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
          if (!isNaN(amount) && amount > 0) {
            return amount;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Extract deductions
 */
function extractDeductions(text: string): Form16Data['deductions'] {
  return {
    section80C: extractAmount(text, /80C|section\s*VI-A/i),
    section80D: extractAmount(text, /80D|health\s*insurance/i),
    section80E: extractAmount(text, /80E|education\s*loan/i),
    hra: extractAmount(text, /HRA|house\s*rent/i),
    lta: extractAmount(text, /LTA|leave\s*travel/i)
  };
}

/**
 * Extract quarterly TDS
 */
function extractQuarterlyTDS(text: string): Array<{ quarter: string; amount: number }> {
  const quarters = [];
  const quarterPatterns = [
    { name: 'Q1', pattern: /quarter\s*1|q1|apr.*jun/i },
    { name: 'Q2', pattern: /quarter\s*2|q2|jul.*sep/i },
    { name: 'Q3', pattern: /quarter\s*3|q3|oct.*dec/i },
    { name: 'Q4', pattern: /quarter\s*4|q4|jan.*mar/i }
  ];

  for (const q of quarterPatterns) {
    const amount = extractAmount(text, q.pattern);
    if (amount) {
      quarters.push({ quarter: q.name, amount });
    }
  }

  return quarters;
}

/**
 * Validate parsed data
 */
export function validateForm16Data(data: Form16Data): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.pan || data.pan.length !== 10) {
    errors.push('Invalid or missing PAN');
  }

  if (!data.employerTAN || data.employerTAN.length !== 10) {
    errors.push('Invalid or missing employer TAN');
  }

  if (data.grossSalary <= 0) {
    errors.push('Invalid gross salary amount');
  }

  if (data.tdsDeducted < 0) {
    errors.push('Invalid TDS amount');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Parse simple salary slip (fallback)
 */
export function parseSalarySlip(text: string): Partial<Form16Data> {
  return {
    grossSalary: extractAmount(text, /gross\s*salary|total\s*earnings/i) || 0,
    netSalary: extractAmount(text, /net\s*salary|take\s*home/i) || 0,
    professionalTax: extractAmount(text, /professional\s*tax|p\.?\s*tax/i) || 0,
    deductions: {
      hra: extractAmount(text, /HRA|house\s*rent/i),
      lta: extractAmount(text, /LTA|leave\s*travel/i)
    }
  };
}
