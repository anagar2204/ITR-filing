'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Calculator as CalcIcon, TrendingUp, TrendingDown, Moon, Sun, ArrowLeft, Lightbulb, Save } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useTheme } from '@/components/ThemeProvider'
import { taxAPI } from '@/lib/api'

export default function CalculatorPage() {
  return (
    <ProtectedRoute>
      <CalculatorContent />
    </ProtectedRoute>
  )
}

function CalculatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, toggleTheme } = useTheme()
  const returnId = searchParams.get('returnId')

  const [formData, setFormData] = useState({
    salaryGross: '',
    otherIncome: '',
    section80C: '',
    section80D: '',
    section80E: '',
    section80G: '',
    hraClaimed: ''
  })

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (returnId) {
      loadReturnData()
    }
  }, [returnId])

  const loadReturnData = async () => {
    if (!returnId) return
    try {
      setLoading(true)
      const data = await taxAPI.getReturnDetails(returnId)
      if (data.success && data.data.income) {
        const income = data.data.income
        const deductions = data.data.deductions || {}
        setFormData({
          salaryGross: income.salary_gross?.toString() || '',
          otherIncome: income.other_income?.toString() || '',
          section80C: deductions.section_80c?.toString() || '',
          section80D: deductions.section_80d?.toString() || '',
          section80E: deductions.section_80e?.toString() || '',
          section80G: deductions.section_80g?.toString() || '',
          hraClaimed: deductions.hra_claimed?.toString() || ''
        })
      }
    } catch (error) {
      console.error('Error loading return:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    setCalculating(true)
    try {
      const payload = {
        returnId: returnId || undefined,
        salaryGross: parseFloat(formData.salaryGross) || 0,
        otherIncome: parseFloat(formData.otherIncome) || 0,
        deductions: {
          section80C: parseFloat(formData.section80C) || 0,
          section80D: parseFloat(formData.section80D) || 0,
          section80E: parseFloat(formData.section80E) || 0,
          section80G: parseFloat(formData.section80G) || 0,
          hraClaimed: parseFloat(formData.hraClaimed) || 0
        }
      }

      const data = await taxAPI.calculateTax(payload)
      if (data.success) {
        setResult(data.data)
      }
    } catch (error) {
      console.error('Error calculating tax:', error)
    } finally {
      setCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 rounded-lg hover:bg-accent transition">
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Link>
              <div className="flex items-center space-x-2">
                <CalcIcon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Tax Calculator</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Income Details</h2>
              
              <div className="space-y-4">
                <InputField
                  label="Gross Salary"
                  value={formData.salaryGross}
                  onChange={(v) => setFormData({...formData, salaryGross: v})}
                  placeholder="12,00,000"
                />
                <InputField
                  label="Other Income"
                  value={formData.otherIncome}
                  onChange={(v) => setFormData({...formData, otherIncome: v})}
                  placeholder="5,000"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Deductions</h2>
              
              <div className="space-y-4">
                <InputField
                  label="Section 80C (Max ₹1,50,000)"
                  value={formData.section80C}
                  onChange={(v) => setFormData({...formData, section80C: v})}
                  placeholder="1,50,000"
                  hint="PPF, ELSS, Life Insurance, etc."
                />
                <InputField
                  label="Section 80D (Max ₹25,000)"
                  value={formData.section80D}
                  onChange={(v) => setFormData({...formData, section80D: v})}
                  placeholder="25,000"
                  hint="Health Insurance Premium"
                />
                <InputField
                  label="Section 80E"
                  value={formData.section80E}
                  onChange={(v) => setFormData({...formData, section80E: v})}
                  placeholder="50,000"
                  hint="Education Loan Interest"
                />
                <InputField
                  label="Section 80G"
                  value={formData.section80G}
                  onChange={(v) => setFormData({...formData, section80G: v})}
                  placeholder="10,000"
                  hint="Donations"
                />
                <InputField
                  label="HRA Claimed"
                  value={formData.hraClaimed}
                  onChange={(v) => setFormData({...formData, hraClaimed: v})}
                  placeholder="1,20,000"
                  hint="House Rent Allowance"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={calculating || !formData.salaryGross}
              className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {calculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <CalcIcon className="h-5 w-5" />
                  <span>Calculate Tax</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Recommendation */}
                <div className={`border-2 rounded-xl p-6 ${
                  result.recommendation === 'new' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-blue-500 bg-blue-500/10'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className={`h-8 w-8 ${
                      result.recommendation === 'new' ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Recommendation</h3>
                      <p className="text-muted-foreground">Best option for you</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {result.recommendation.toUpperCase()} REGIME
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                    <span className="text-lg text-foreground">
                      Save {formatCurrency(result.savings)}
                    </span>
                  </div>
                </div>

                {/* Old Regime */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Old Regime</h3>
                  <div className="space-y-3">
                    <ResultRow label="Total Income" value={formatCurrency(result.old.totalIncome)} />
                    <ResultRow label="Taxable Income" value={formatCurrency(result.old.taxableIncome)} />
                    <ResultRow label="Tax Before Rebate" value={formatCurrency(result.old.taxBeforeRebate)} />
                    {result.old.rebate87A > 0 && (
                      <ResultRow label="Rebate (87A)" value={`-${formatCurrency(result.old.rebate87A)}`} className="text-green-500" />
                    )}
                    <ResultRow label="Tax Payable" value={formatCurrency(result.old.taxPayable)} />
                    <ResultRow label="Cess (4%)" value={formatCurrency(result.old.cess)} />
                    <div className="pt-3 border-t border-border">
                      <ResultRow 
                        label="Total Tax" 
                        value={formatCurrency(result.old.totalTax)} 
                        className="text-xl font-bold"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Effective Rate: {result.old.effectiveRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* New Regime */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">New Regime</h3>
                  <div className="space-y-3">
                    <ResultRow label="Total Income" value={formatCurrency(result.new.totalIncome)} />
                    <ResultRow label="Taxable Income" value={formatCurrency(result.new.taxableIncome)} />
                    <ResultRow label="Tax Before Rebate" value={formatCurrency(result.new.taxBeforeRebate)} />
                    {result.new.rebate87A > 0 && (
                      <ResultRow label="Rebate (87A)" value={`-${formatCurrency(result.new.rebate87A)}`} className="text-green-500" />
                    )}
                    <ResultRow label="Tax Payable" value={formatCurrency(result.new.taxPayable)} />
                    <ResultRow label="Cess (4%)" value={formatCurrency(result.new.cess)} />
                    <div className="pt-3 border-t border-border">
                      <ResultRow 
                        label="Total Tax" 
                        value={formatCurrency(result.new.totalTax)} 
                        className="text-xl font-bold"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Effective Rate: {result.new.effectiveRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <CalcIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Calculate</h3>
                <p className="text-muted-foreground">
                  Enter your income and deductions, then click Calculate Tax to see your results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, hint }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

function ResultRow({ label, value, className = '' }: any) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}
