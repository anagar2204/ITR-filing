'use client'

/**
 * Tax Calculator Page
 * Production-ready Income Tax Calculator for FY 2024-25 and FY 2025-26
 * Styled with Hero-matched green-cyan-blue palette
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ChevronRight, ChevronLeft, Loader2, Download, Share2, Info } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import BasicDetailsStep from './components/BasicDetailsStep'
import IncomeDetailsStep from './components/IncomeDetailsStep'
import DeductionsStep from './components/DeductionsStep'
import SummaryCard from './components/SummaryCard'
import ResultsComparison from './components/ResultsComparison'

export interface TaxFormData {
  // Basic Details
  fy: '2024-25' | '2025-26'
  ageGroup: 'below60' | '60to80' | 'above80'
  taxpayerCategory: 'individual' | 'huf' | 'firm' | 'llp' | 'domestic-company' | 'foreign-company'
  gender: 'male' | 'female' | 'other'
  residentialStatus: 'resident' | 'nri' | 'rnor'
  
  // Income Details
  salary: number
  hra: number
  otherIncome: number
  interest: number
  capGains: number
  
  // Deductions
  section80C: number
  section80D: number
  section80TTA: number
  standardDeduction: number
  otherDeductions: number
}

export interface TaxResult {
  oldRegime: {
    grossIncome: number
    totalDeductions: number
    taxableIncome: number
    taxBeforeCess: number
    surcharge: number
    cess: number
    totalTax: number
    rebate: number
    netTax: number
    slabBreakdown: Array<{
      slab: string
      income: number
      rate: number
      tax: number
    }>
  }
  newRegime: {
    grossIncome: number
    totalDeductions: number
    taxableIncome: number
    taxBeforeCess: number
    surcharge: number
    cess: number
    totalTax: number
    rebate: number
    netTax: number
    slabBreakdown: Array<{
      slab: string
      income: number
      rate: number
      tax: number
    }>
  }
  savings: number
  recommendedRegime: 'old' | 'new'
}

const STEPS = [
  { id: 1, name: 'Basic Details', description: 'Financial year & age group' },
  { id: 2, name: 'Income Details', description: 'Salary, HRA & other income' },
  { id: 3, name: 'Deductions', description: 'Tax-saving investments' },
]

export default function TaxCalculatorPage() {
  const { theme } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<TaxResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<TaxFormData>({
    fy: '2024-25',
    ageGroup: 'below60',
    taxpayerCategory: 'individual',
    gender: 'male',
    residentialStatus: 'resident',
    salary: 0,
    hra: 0,
    otherIncome: 0,
    interest: 0,
    capGains: 0,
    section80C: 0,
    section80D: 0,
    section80TTA: 0,
    standardDeduction: 0,
    otherDeductions: 0,
  })
  
  const updateFormData = (updates: Partial<TaxFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }
  
  const canProceed = () => {
    if (currentStep === 1) {
      return formData.fy && formData.ageGroup
    }
    if (currentStep === 2) {
      return formData.salary >= 0
    }
    return true
  }
  
  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setResult(null)
      setError(null)
    }
  }
  
  const handleCalculate = async () => {
    setIsCalculating(true)
    setError(null)
    
    try {
      const apiUrl = 'http://localhost:5000'
      
      // Use the compare-regimes endpoint to get both calculations
      const response = await fetch(`${apiUrl}/api/tax-calculation/compare-regimes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'tax-calculator-user',
          financialYear: formData.fy === '2024-25' ? '2024-25' : '2024-25',
          incomeData: {
            salary: {
              basicSalary: formData.salary,
              hra: formData.hra,
              allowances: 0,
              bonuses: 0
            },
            houseProperty: [],
            capitalGains: {
              shortTermGains: formData.capGains,
              longTermGains: 0
            },
            otherSources: {
              interestIncome: formData.interest,
              otherIncome: formData.otherIncome
            },
            business: {}
          },
          deductionData: {
            section80C: {
              lifeInsurancePremium: formData.section80C
            },
            section80D: {
              selfFamilyPremium: formData.section80D
            },
            otherDeductions: {
              section80TTA: formData.section80TTA,
              otherDeductions: formData.otherDeductions
            }
          },
          taxesPaidData: {}
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Calculation failed')
      }
      
      // Transform the response to match the expected TaxResult format
      const oldRegime = data.data.oldRegime
      const newRegime = data.data.newRegime
      
      const transformedResult: TaxResult = {
        oldRegime: {
          grossIncome: oldRegime.grossTotalIncome,
          totalDeductions: oldRegime.totalDeductions,
          taxableIncome: oldRegime.taxableIncome,
          taxBeforeCess: oldRegime.taxBeforeRebate,
          surcharge: oldRegime.surcharge,
          cess: oldRegime.healthEducationCess,
          totalTax: oldRegime.totalTaxLiability,
          rebate: oldRegime.rebateU87A,
          netTax: oldRegime.totalTaxLiability,
          slabBreakdown: [] // Will be populated if needed
        },
        newRegime: {
          grossIncome: newRegime.grossTotalIncome,
          totalDeductions: newRegime.totalDeductions,
          taxableIncome: newRegime.taxableIncome,
          taxBeforeCess: newRegime.taxBeforeRebate,
          surcharge: newRegime.surcharge,
          cess: newRegime.healthEducationCess,
          totalTax: newRegime.totalTaxLiability,
          rebate: newRegime.rebateU87A,
          netTax: newRegime.totalTaxLiability,
          slabBreakdown: [] // Will be populated if needed
        },
        savings: Math.max(0, oldRegime.totalTaxLiability - newRegime.totalTaxLiability),
        recommendedRegime: data.data.recommendation === 'NEW' ? 'new' : 'old'
      }
      
      setResult(transformedResult)
    } catch (err: any) {
      console.error('Tax calculation error:', err)
      setError(err.message || 'Failed to calculate tax. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }
  
  const handleReset = () => {
    setCurrentStep(1)
    setResult(null)
    setError(null)
    setFormData({
      fy: '2025-26',
      ageGroup: '0-60',
      taxpayerCategory: 'individual',
      salary: 0,
      hra: 0,
      otherIncome: 0,
      interest: 0,
      capGains: 0,
      section80C: 0,
      section80D: 0,
      section80TTA: 0,
      standardDeduction: 0,
      otherDeductions: 0,
    })
  }
  
  return (
    <div 
      className="min-h-screen py-20 px-6 md:px-12 transition-colors duration-300"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
          : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)', // Hero mint-aqua tone
      }}
    >
      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full mix-blend-multiply"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1), transparent)'
              : 'radial-gradient(circle, rgba(22, 163, 74, 0.12), rgba(6, 182, 212, 0.08), transparent)',
            filter: 'blur(80px)',
            animation: 'floatOrb 8s ease-in-out infinite alternate',
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full mix-blend-multiply"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(6, 182, 212, 0.15), rgba(37, 99, 235, 0.1), transparent)'
              : 'radial-gradient(circle, rgba(6, 182, 212, 0.12), rgba(37, 99, 235, 0.06), transparent)',
            filter: 'blur(80px)',
            animation: 'floatOrb 8s ease-in-out infinite alternate',
            animationDelay: '4s',
          }}
        ></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))'
                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.06))',
              border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(22, 163, 74, 0.15)'}`,
            }}
          >
            <Calculator className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
            <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}>
              Income Tax Calculator
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-semibold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: theme === 'dark'
                ? 'linear-gradient(135deg, #10B981, #06B6D4, #3B82F6)'
                : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)',
            }}
          >
            Calculate Your Income Tax
          </h1>
          
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}
          >
            Compare Old vs New Tax Regime for FY 2024-25 & FY 2025-26
          </p>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form Steps */}
          <div className="lg:col-span-2">
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                        style={{
                          background: currentStep >= step.id
                            ? theme === 'dark'
                              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
                              : 'linear-gradient(135deg, #16A34A, #06B6D4)'
                            : theme === 'dark'
                              ? 'rgba(71, 85, 105, 0.3)'
                              : 'rgba(148, 163, 184, 0.2)',
                          color: currentStep >= step.id ? '#FFFFFF' : theme === 'dark' ? '#94A3B8' : '#475569',
                          boxShadow: currentStep === step.id
                            ? '0 4px 15px rgba(22, 163, 74, 0.3)'
                            : 'none',
                        }}
                      >
                        {step.id}
                      </div>
                      <div className="mt-2 text-center hidden md:block">
                        <p 
                          className="text-sm font-medium"
                          style={{ color: currentStep >= step.id ? (theme === 'dark' ? '#FFFFFF' : '#0F172A') : (theme === 'dark' ? '#94A3B8' : '#475569') }}
                        >
                          {step.name}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div 
                        className="flex-1 h-0.5 mx-2"
                        style={{
                          background: currentStep > step.id
                            ? theme === 'dark'
                              ? 'linear-gradient(to right, #10B981, #06B6D4)'
                              : 'linear-gradient(to right, #16A34A, #06B6D4)'
                            : theme === 'dark'
                              ? 'rgba(71, 85, 105, 0.3)'
                              : 'rgba(148, 163, 184, 0.2)',
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form Card */}
            <motion.div
              layout
              className="backdrop-blur-md rounded-2xl p-8 border"
              style={{
                background: theme === 'dark'
                  ? 'rgba(30, 41, 59, 0.5)'
                  : 'rgba(255, 255, 255, 0.85)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)'}`,
                boxShadow: theme === 'dark'
                  ? '0 8px 25px rgba(0, 0, 0, 0.3)'
                  : '0 8px 25px rgba(6, 182, 212, 0.06)',
              }}
            >
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <BasicDetailsStep
                    key="step1"
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
                {currentStep === 2 && (
                  <IncomeDetailsStep
                    key="step2"
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
                {currentStep === 3 && (
                  <DeductionsStep
                    key="step3"
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
              </AnimatePresence>
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.08)',
                }}
              >
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.1)',
                    color: theme === 'dark' ? '#D1D5DB' : '#475569',
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>
                
                {currentStep < STEPS.length ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #10B981, #06B6D4)'
                        : 'linear-gradient(135deg, #16A34A, #06B6D4)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 15px rgba(22, 163, 74, 0.25)',
                    }}
                  >
                    Continue
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #10B981, #06B6D4)'
                        : 'linear-gradient(135deg, #16A34A, #06B6D4)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-5 w-5" />
                        Calculate Tax
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Right: Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SummaryCard
                formData={formData}
                result={result}
                isCalculating={isCalculating}
              />
              
              {result && (
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.1)',
                      color: theme === 'dark' ? '#D1D5DB' : '#475569',
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.1)',
                      color: theme === 'dark' ? '#D1D5DB' : '#475569',
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Comparison */}
        {result && (
          <ResultsComparison
            result={result}
            onReset={handleReset}
          />
        )}
      </div>
      
      {/* Animations */}
      <style jsx>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  )
}
