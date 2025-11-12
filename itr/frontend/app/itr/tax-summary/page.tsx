'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import ITRStepper from '../components/ITRStepper'
import { CheckCircle, ArrowLeft, FileCheck, TrendingUp, DollarSign, Award, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TaxSummary {
  itrType: string
  regime: 'Old' | 'New'
  grossIncome: number
  taxSavings: number
  taxableIncome: number
  totalTax: number
  alreadyPaid: number
  refund: number
  oldRegimeTax: number
  newRegimeTax: number
}

export default function TaxSummaryRedesigned() {
  const { theme } = useTheme()
  const router = useRouter()

  const [summary, setSummary] = useState<TaxSummary>({
    itrType: 'ITR-1',
    regime: 'New',
    grossIncome: 1200000,
    taxSavings: 150000,
    taxableIncome: 1050000,
    totalTax: 73500,
    alreadyPaid: 60000,
    refund: 13500,
    oldRegimeTax: 85000,
    newRegimeTax: 73500
  })

  const [animatedValues, setAnimatedValues] = useState({
    grossIncome: 0,
    taxSavings: 0,
    taxableIncome: 0,
    totalTax: 0,
    alreadyPaid: 0,
    refund: 0
  })

  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Fetch real tax calculation from backend
  useEffect(() => {
    const fetchTaxSummary = async () => {
      try {
        const response = await fetch('http://localhost:8049/api/itr/summary', {
          headers: {
            'user-id': 'default-user'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const newRegime = data.data.newRegime
          const oldRegime = data.data.oldRegime
          
          setSummary({
            itrType: 'ITR-1',
            regime: data.data.recommended === 'new' ? 'New' : 'Old',
            grossIncome: newRegime.breakdown.grossIncome,
            taxSavings: newRegime.breakdown.totalDeductions,
            taxableIncome: newRegime.breakdown.taxableIncome,
            totalTax: newRegime.breakdown.totalTaxLiability,
            alreadyPaid: newRegime.breakdown.totalTaxPaid,
            refund: newRegime.breakdown.refundOrDue,
            oldRegimeTax: oldRegime.breakdown.totalTaxLiability,
            newRegimeTax: newRegime.breakdown.totalTaxLiability
          })
        }
      } catch (error) {
        console.error('Failed to fetch tax summary:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTaxSummary()
  }, [])

  // Animate count-up for all values
  useEffect(() => {
    const duration = 800
    const steps = 30
    const keys = Object.keys(animatedValues) as (keyof typeof animatedValues)[]
    
    keys.forEach((key, index) => {
      const targetValue = summary[key]
      const increment = targetValue / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= targetValue) {
          setAnimatedValues(prev => ({ ...prev, [key]: targetValue }))
          clearInterval(timer)
        } else {
          setAnimatedValues(prev => ({ ...prev, [key]: Math.floor(current) }))
        }
      }, duration / steps)
    })
  }, [summary])

  const savingsAmount = summary.oldRegimeTax - summary.newRegimeTax

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #ECFFF6 0%, #F7FEFF 100%)'
    }}>
      <ITRStepper />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
              Calculation Complete
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
          }}>
            Your Tax Summary
          </h1>
          <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
            Review your tax calculation and file your return
          </p>
        </motion.div>

        {/* Regime Comparison - Flat Inline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Old Regime */}
            <div className="flex-1 text-center p-6 rounded-xl transition-all" style={{
              background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(241, 245, 249, 0.8)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)'}`
            }}>
              <div className="text-sm font-medium mb-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                Old Regime
              </div>
              <div className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                ₹{summary.oldRegimeTax.toLocaleString()}
              </div>
            </div>

            {/* New Regime - Recommended */}
            <div className="flex-1 text-center p-6 rounded-xl transition-all relative overflow-hidden" style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
              border: '2px solid #16A34A',
              boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)'
            }}>
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white" style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4)'
              }}>
                Recommended
              </div>
              <div className="text-sm font-medium mb-2" style={{ color: '#16A34A' }}>
                New Regime
              </div>
              <div className="text-3xl font-bold" style={{ color: '#16A34A' }}>
                ₹{summary.newRegimeTax.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Animated Bar Comparison */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm w-24" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Old</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.9)'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.oldRegimeTax / Math.max(summary.oldRegimeTax, summary.newRegimeTax)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'rgba(148, 163, 184, 0.6)' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-24 font-medium" style={{ color: '#16A34A' }}>New</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.9)'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.newRegimeTax / Math.max(summary.oldRegimeTax, summary.newRegimeTax)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #16A34A, #06B6D4)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Result Highlight Band */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-xl backdrop-blur-md"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
            border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                You save with New Regime
              </div>
              <div className="text-3xl font-bold" style={{ color: '#16A34A' }}>
                ₹{savingsAmount.toLocaleString()}
              </div>
            </div>
            <Award className="h-12 w-12" style={{ color: '#16A34A', opacity: 0.5 }} />
          </div>
        </motion.div>

        {/* Flat Data List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 space-y-0 rounded-xl overflow-hidden"
          style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)'}`
          }}
        >
          {[
            { label: 'Gross Income', value: animatedValues.grossIncome, icon: <DollarSign className="h-5 w-5" />, color: '#16A34A' },
            { label: 'Tax Savings', value: animatedValues.taxSavings, icon: <TrendingUp className="h-5 w-5" />, color: '#06B6D4' },
            { label: 'Taxable Income', value: animatedValues.taxableIncome, icon: <FileCheck className="h-5 w-5" />, color: '#2563EB' },
            { label: 'Total Tax', value: animatedValues.totalTax, icon: <DollarSign className="h-5 w-5" />, color: '#7C3AED' },
            { label: 'Tax Already Paid', value: animatedValues.alreadyPaid, icon: <CheckCircle className="h-5 w-5" />, color: '#F59E0B' },
            { label: 'Refund Amount', value: animatedValues.refund, icon: <Award className="h-5 w-5" />, color: '#10B981', highlight: true },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center justify-between p-4 transition-colors hover:bg-black/5"
              style={{
                borderBottom: index < 5 ? `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.1)'}` : 'none',
                background: item.highlight 
                  ? theme === 'dark' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(16, 185, 129, 0.05)'
                  : 'transparent'
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{ color: item.color }}>
                  {item.icon}
                </div>
                <span className="font-medium" style={{ 
                  color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
                  fontWeight: item.highlight ? 600 : 500
                }}>
                  {item.label}
                </span>
              </div>
              <span className="text-xl font-semibold tabular-nums" style={{ 
                color: item.highlight ? item.color : theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                ₹{item.value.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ITR Type Info - Minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 p-4 rounded-xl flex items-center justify-between"
          style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)'}`,
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5" style={{ color: '#06B6D4' }} />
            <div>
              <span className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                Your ITR Type: {summary.itrType}
              </span>
              <span className="text-sm ml-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                For individuals with salary income
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              border: `1px solid ${theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
              color: '#06B6D4'
            }}
          >
            View Computation
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </motion.div>

        {/* Computation Details Accordion */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden rounded-xl"
              style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)'}`,
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="p-6">
                <h3 className="font-semibold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Detailed Tax Computation
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Income from Salary</span>
                    <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>₹{summary.grossIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Less: Deductions</span>
                    <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>₹{summary.taxSavings.toLocaleString()}</span>
                  </div>
                  <div className="h-px my-2" style={{ background: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)' }} />
                  <div className="flex justify-between font-semibold">
                    <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>Taxable Income</span>
                    <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>₹{summary.taxableIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => router.push('/itr/tax-saving')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style={{
              border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`,
              color: theme === 'dark' ? '#34D399' : '#16A34A'
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <button
            onClick={() => alert('E-Filing functionality will be implemented')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
            }}
          >
            <FileCheck className="h-5 w-5" />
            E-File ITR Now
          </button>
        </div>
      </div>
    </div>
  )
}
