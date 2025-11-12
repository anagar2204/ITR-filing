import fs from 'fs'
import pdf from 'pdf-parse'

interface ParsedForm16 {
  fileId: string
  confidence: number
  parsed: {
    employer: {
      name: string
      pan: string
    }
    employee: {
      name: string
      pan: string
    }
    financialYear: string
    salary: {
      basic: number
      hra: number
      specialAllowance: number
      lta: number
      totalSalary: number
    }
    deductions: {
      section80C: number
      section80D: number
      other: Array<{ section: string; amount: number }>
    }
    taxDeducted: number
    annexure: Array<{ head: string; amount: number }>
  }
  rawText: string
  warnings: string[]
}

export async function parseForm16PDF(
  filePath: string,
  progressCallback?: (progress: number) => void
): Promise<ParsedForm16> {
  try {
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath)
    
    if (progressCallback) progressCallback(20)

    // Parse PDF
    const pdfData = await pdf(dataBuffer)
    const text = pdfData.text

    if (progressCallback) progressCallback(50)

    // Extract data using regex patterns
    const parsed = extractForm16Data(text)

    if (progressCallback) progressCallback(90)

    // Calculate confidence based on extracted fields
    const confidence = calculateConfidence(parsed)

    if (progressCallback) progressCallback(100)

    return {
      fileId: '',
      confidence,
      parsed,
      rawText: text,
      warnings: generateWarnings(parsed, confidence)
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF')
  }
}

function extractForm16Data(text: string): ParsedForm16['parsed'] {
  // Extract employer details
  const employerName = extractPattern(text, /Name and address of the Employer\s*([^\n]+)/, 1) || 
                       extractPattern(text, /Employer Name\s*:?\s*([^\n]+)/, 1) || ''
  const employerPAN = extractPattern(text, /PAN of the Deductor\s*:?\s*([A-Z]{5}[0-9]{4}[A-Z])/, 1) || ''

  // Extract employee details
  const employeeName = extractPattern(text, /Name of the Employee\s*:?\s*([^\n]+)/, 1) ||
                       extractPattern(text, /Employee Name\s*:?\s*([^\n]+)/, 1) || ''
  const employeePAN = extractPattern(text, /PAN of the Employee\s*:?\s*([A-Z]{5}[0-9]{4}[A-Z])/, 1) || ''

  // Extract financial year
  const financialYear = extractPattern(text, /Financial Year\s*:?\s*(\d{4}-\d{2,4})/, 1) ||
                        extractPattern(text, /Period\s*:?\s*(\d{4}-\d{2,4})/, 1) || ''

  // Extract salary components
  const grossSalary = extractAmount(text, /Gross Salary.*?(\d+(?:,\d+)*(?:\.\d+)?)/)
  const basic = extractAmount(text, /Basic Salary.*?(\d+(?:,\d+)*(?:\.\d+)?)/)
  const hra = extractAmount(text, /House Rent Allowance.*?(\d+(?:,\d+)*(?:\.\d+)?)/) ||
              extractAmount(text, /HRA.*?(\d+(?:,\d+)*(?:\.\d+)?)/)
  const specialAllowance = extractAmount(text, /Special Allowance.*?(\d+(?:,\d+)*(?:\.\d+)?)/)
  const lta = extractAmount(text, /Leave Travel Allowance.*?(\d+(?:,\d+)*(?:\.\d+)?)/) ||
              extractAmount(text, /LTA.*?(\d+(?:,\d+)*(?:\.\d+)?)/)

  // Extract deductions
  const section80C = extractAmount(text, /Section 80C.*?(\d+(?:,\d+)*(?:\.\d+)?)/) ||
                     extractAmount(text, /80C.*?(\d+(?:,\d+)*(?:\.\d+)?)/)
  const section80D = extractAmount(text, /Section 80D.*?(\d+(?:,\d+)*(?:\.\d+)?)/) ||
                     extractAmount(text, /80D.*?(\d+(?:,\d+)*(?:\.\d+)?)/)

  // Extract tax deducted
  const taxDeducted = extractAmount(text, /Tax Deducted at Source.*?(\d+(?:,\d+)*(?:\.\d+)?)/) ||
                      extractAmount(text, /Total Tax Deducted.*?(\d+(?:,\d+)*(?:\.\d+)?)/) ||
                      extractAmount(text, /TDS.*?(\d+(?:,\d+)*(?:\.\d+)?)/)

  return {
    employer: {
      name: employerName.trim(),
      pan: employerPAN
    },
    employee: {
      name: employeeName.trim(),
      pan: employeePAN
    },
    financialYear,
    salary: {
      basic: basic || 0,
      hra: hra || 0,
      specialAllowance: specialAllowance || 0,
      lta: lta || 0,
      totalSalary: grossSalary || (basic + hra + specialAllowance + lta)
    },
    deductions: {
      section80C: section80C || 0,
      section80D: section80D || 0,
      other: []
    },
    taxDeducted: taxDeducted || 0,
    annexure: []
  }
}

function extractPattern(text: string, pattern: RegExp, groupIndex: number = 0): string | null {
  const match = text.match(pattern)
  return match ? match[groupIndex] : null
}

function extractAmount(text: string, pattern: RegExp): number {
  const match = text.match(pattern)
  if (!match || !match[1]) return 0
  
  // Remove commas and parse as float
  const amount = match[1].replace(/,/g, '')
  return parseFloat(amount) || 0
}

function calculateConfidence(parsed: ParsedForm16['parsed']): number {
  let score = 0
  let total = 0

  // Check employer details (20%)
  if (parsed.employer.name) score += 10
  if (parsed.employer.pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(parsed.employer.pan)) score += 10
  total += 20

  // Check employee details (20%)
  if (parsed.employee.name) score += 10
  if (parsed.employee.pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(parsed.employee.pan)) score += 10
  total += 20

  // Check financial year (10%)
  if (parsed.financialYear) score += 10
  total += 10

  // Check salary (30%)
  if (parsed.salary.totalSalary > 0) score += 15
  if (parsed.salary.basic > 0 || parsed.salary.hra > 0) score += 15
  total += 30

  // Check tax deducted (20%)
  if (parsed.taxDeducted > 0) score += 20
  total += 20

  return score / total
}

function generateWarnings(parsed: ParsedForm16['parsed'], confidence: number): string[] {
  const warnings: string[] = []

  if (confidence < 0.7) {
    warnings.push('Low confidence in extracted data. Please review carefully.')
  }

  if (!parsed.employer.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(parsed.employer.pan)) {
    warnings.push('Employer PAN not found or invalid')
  }

  if (!parsed.employee.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(parsed.employee.pan)) {
    warnings.push('Employee PAN not found or invalid')
  }

  if (parsed.salary.totalSalary === 0) {
    warnings.push('Total salary could not be extracted')
  }

  if (parsed.taxDeducted === 0) {
    warnings.push('Tax deducted amount not found')
  }

  return warnings
}
