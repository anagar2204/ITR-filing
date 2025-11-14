'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { CheckCircle, ArrowLeft, FileCheck, TrendingUp, DollarSign, Award, Download, Calculator, AlertCircle, Info, Target, PiggyBank } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TaxSummaryData {
  userId: string
  financialYear: string
  calculationDate: string
  dataQuality: {
    hasIncome: boolean
    hasDeductions: boolean
    completenessScore: number
    accuracyScore: number
  }
  oldRegime: {
    grossTotalIncome: number
    totalDeductions: number
    taxableIncome: number
    totalTaxLiability: number
    effectiveRate: number
    marginalRate: number
  }
  newRegime: {
    grossTotalIncome: number
    totalDeductions: number
    taxableIncome: number
    totalTaxLiability: number
    effectiveRate: number
    marginalRate: number
  }
  recommendation: {
    regime: 'OLD' | 'NEW'
    savings: number
    reason: string
  }
  breakdown: {
    incomeBreakdown: {
      salary: number
      houseProperty: number
      capitalGains: number
      otherSources: number
      business: number
    }
    deductionBreakdown: {
      section80C: number
      section80D: number
      otherDeductions: number
    }
    taxBreakdown: {
      oldRegime: any
      newRegime: any
    }
  }
}

export default function TaxSummaryPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [summary, setSummary] = useState<TaxSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTaxSummary()
  }, [])

  const fetchTaxSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/tax-calculation/simple-summary?userId=default-user&financialYear=2024-25')
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setSummary(data.data)
        setError(null)
      } else {
        setError(data.message || 'No tax data found')
      }
    } catch (err) {
      console.warn('Tax summary not available:', err.message || 'No data')
      setError('Failed to fetch tax summary. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tax-calculation/pdf-receipt?userId=default-user&financialYear=2024-25')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tax-receipt-${new Date().getFullYear()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate PDF receipt')
      }
    } catch (error) {
      console.warn('PDF download failed:', error.message || 'Unknown error')
      alert('Failed to download PDF receipt')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F3FAF7 0%, #ECF5FF 100%)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{
            borderColor: '#16A34A'
          }}></div>
          <p style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
            Calculating your tax summary...
          </p>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen py-12 px-4" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F3FAF7 0%, #ECF5FF 100%)'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-8 rounded-2xl backdrop-blur-md" style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`
          }}>
            <div className="text-orange-500 mb-4">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              No Tax Data Found
            </h2>
            <p className="text-lg mb-6" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
              {error || 'Please add your income and deduction information to generate tax summary.'}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl" style={{
                background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
              }}>
                <DollarSign className="h-8 w-8 mb-2 mx-auto" style={{ color: '#16A34A' }} />
                <h3 className="font-semibold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Add Income Sources
                </h3>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Add your salary, house property, or other income sources
                </p>
              </div>
              
              <div className="p-4 rounded-xl" style={{
                background: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)'}`
              }}>
                <PiggyBank className="h-8 w-8 mb-2 mx-auto" style={{ color: '#06B6D4' }} />
                <h3 className="font-semibold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Add Tax Deductions
                </h3>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Add Section 80C, 80D and other tax-saving investments
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/itr/income-sources')}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                  boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)'
                }}
              >
                <DollarSign className="h-5 w-5 inline mr-2" />
                Add Income Sources
              </button>
              <button
                onClick={() => router.push('/itr/tax-savings')}
                className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{
                  border: `2px solid ${theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
                  color: '#06B6D4',
                  background: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)'
                }}
              >
                <PiggyBank className="h-5 w-5 inline mr-2" />
                Add Tax Savings
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const recommendedRegime = summary.recommendation.regime === 'OLD' ? summary.oldRegime : summary.newRegime
  const alternativeRegime = summary.recommendation.regime === 'OLD' ? summary.newRegime : summary.oldRegime

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
        : 'linear-gradient(135deg, #F3FAF7 0%, #ECF5FF 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{
            background: theme === 'dark'
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
          }}>
            <CheckCircle className="h-4 w-4" style={{ color: '#16A34A' }} />
            <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
              Tax Summary Ready
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent" style={{
            backgroundImage: theme === 'dark'
              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
              : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)'
          }}>
            Your Tax Summary
          </h1>
          <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
            Accuracy Score: {summary.dataQuality.accuracyScore.toFixed(1)}% | 
            Data Completeness: {summary.dataQuality.completenessScore.toFixed(1)}%
          </p>
        </motion.div>

        {/* Data Quality Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl"
          style={{
            background: summary.dataQuality.completenessScore >= 80 
              ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
              : (theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'),
            border: `1px solid ${summary.dataQuality.completenessScore >= 80 ? '#16A34A' : '#F59E0B'}`
          }}
        >
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5" style={{ 
              color: summary.dataQuality.completenessScore >= 80 ? '#16A34A' : '#F59E0B' 
            }} />
            <div>
              <span className="font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                Data Quality: {summary.dataQuality.completenessScore >= 80 ? 'Good' : 'Needs Improvement'}
              </span>
              <span className="text-sm ml-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                {summary.dataQuality.hasIncome ? '✓ Income Added' : '✗ No Income'} | 
                {summary.dataQuality.hasDeductions ? ' ✓ Deductions Added' : ' ✗ No Deductions'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Regime Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recommended Regime */}
            <div className="p-6 rounded-2xl backdrop-blur-md border relative" style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
              borderColor: '#16A34A',
              borderWidth: '2px'
            }}>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4)'
              }}>
                RECOMMENDED
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#16A34A' }}>
                {summary.recommendation.regime} Tax Regime
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>Gross Income</span>
                  <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    ₹{recommendedRegime.grossTotalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>Total Deductions</span>
                  <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    ₹{recommendedRegime.totalDeductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>Taxable Income</span>
                  <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    ₹{recommendedRegime.taxableIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)',
                  color: '#16A34A'
                }}>
                  <span>Total Tax</span>
                  <span>₹{recommendedRegime.totalTaxLiability.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Effective Rate</span>
                  <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    {recommendedRegime.effectiveRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Alternative Regime */}
            <div className="p-6 rounded-2xl backdrop-blur-md border" style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
            }}>
              <h3 className="text-xl font-semibold mb-4" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                {summary.recommendation.regime === 'OLD' ? 'NEW' : 'OLD'} Tax Regime
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>Gross Income</span>
                  <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    ₹{alternativeRegime.grossTotalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>Total Deductions</span>
                  <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    ₹{alternativeRegime.totalDeductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>Taxable Income</span>
                  <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    ₹{alternativeRegime.taxableIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)',
                  color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                }}>
                  <span>Total Tax</span>
                  <span>₹{alternativeRegime.totalTaxLiability.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Effective Rate</span>
                  <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    {alternativeRegime.effectiveRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tax Savings Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-6 rounded-2xl backdrop-blur-md text-center"
          style={{
            background: 'linear-gradient(135deg, #16A34A, #06B6D4)',
            color: '#FFFFFF'
          }}
        >
          <Award className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-2">
            You Save ₹{summary.recommendation.savings.toLocaleString()}
          </h3>
          <p className="opacity-90 max-w-2xl mx-auto">
            {summary.recommendation.reason}
          </p>
        </motion.div>

        {/* Income & Deduction Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 grid md:grid-cols-2 gap-6"
        >
          {/* Income Breakdown */}
          <div className="p-6 rounded-2xl backdrop-blur-md border" style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              Income Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.breakdown.incomeBreakdown).map(([key, value]) => (
                value > 0 && (
                  <div key={key} className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                      ₹{(value as number).toLocaleString()}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Deduction Breakdown */}
          <div className="p-6 rounded-2xl backdrop-blur-md border" style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              Deduction Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.breakdown.deductionBreakdown).map(([key, value]) => (
                value > 0 && (
                  <div key={key} className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                      ₹{(value as number).toLocaleString()}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push('/itr/tax-savings')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style={{
              border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`,
              color: theme === 'dark' ? '#34D399' : '#16A34A'
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Tax Savings
          </button>
          
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
              color: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)'
            }}
          >
            <Download className="h-5 w-5" />
            Download PDF Receipt
          </button>
          
          <button
            onClick={() => router.push('/tax-calculator')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style={{
              background: theme === 'dark' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
              border: `2px solid ${theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
              color: '#06B6D4'
            }}
          >
            <Calculator className="h-5 w-5" />
            Recalculate
          </button>
        </motion.div>
      </div>
    </div>
  )
}
