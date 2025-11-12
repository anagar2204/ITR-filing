'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { TaxFormData, TaxResult } from '../page'
import { Calculator, TrendingDown, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SummaryCardProps {
  formData: TaxFormData
  result: TaxResult | null
  isCalculating: boolean
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function SummaryCard({ formData, result, isCalculating }: SummaryCardProps) {
  const { theme } = useTheme()
  const [displayValue, setDisplayValue] = useState(0)
  const [animationStep, setAnimationStep] = useState(0)
  
  const totalIncome = formData.salary + formData.hra + formData.otherIncome + formData.interest + formData.capGains
  const totalDeductions = formData.section80C + formData.section80D + formData.section80TTA + formData.otherDeductions
  
  // Count-up animation for result
  useEffect(() => {
    if (result) {
      const targetValue = Math.min(result.oldRegime.netTax, result.newRegime.netTax)
      let startTime: number | null = null
      const duration = 1200 // 1.2s
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        
        // Ease-out cubic
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
        const easedProgress = easeOutCubic(progress)
        
        setDisplayValue(Math.round(easedProgress * targetValue))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    } else {
      setDisplayValue(0)
    }
  }, [result])
  
  // Process animation steps
  useEffect(() => {
    if (isCalculating) {
      setAnimationStep(0)
      const timer1 = setTimeout(() => setAnimationStep(1), 300)
      const timer2 = setTimeout(() => setAnimationStep(2), 600)
      const timer3 = setTimeout(() => setAnimationStep(3), 900)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isCalculating])
  
  const processSteps = [
    { label: 'Income', icon: '💰', value: totalIncome },
    { label: 'Deductions', icon: '📊', value: totalDeductions },
    { label: 'Calculating', icon: '🧮', value: 0 },
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="backdrop-blur-md rounded-2xl p-6 border"
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
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
        <h3 
          className="text-lg font-semibold"
          style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
        >
          Tax Summary
        </h3>
      </div>
      
      {/* Process Animation */}
      {isCalculating && (
        <div className="space-y-3 mb-6">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: animationStep >= index ? 1 : 0.3,
                x: animationStep >= index ? 0 : -10,
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: animationStep >= index
                  ? theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                    : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))'
                  : theme === 'dark'
                    ? 'rgba(71, 85, 105, 0.2)'
                    : 'rgba(148, 163, 184, 0.1)',
              }}
            >
              <span className="text-2xl">{step.icon}</span>
              <div className="flex-1">
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
                >
                  {step.label}
                </p>
                {step.value > 0 && (
                  <p 
                    className="text-xs"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                  >
                    {formatCurrency(step.value)}
                  </p>
                )}
              </div>
              {animationStep === index && (
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Result Display */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div 
              className="p-6 rounded-xl mb-4"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))'
                  : 'linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(6, 182, 212, 0.15))',
                border: `2px solid ${theme === 'dark' ? '#10B981' : '#16A34A'}`,
              }}
            >
              <p 
                className="text-sm mb-2"
                style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
              >
                Recommended Tax
              </p>
              <p 
                className="text-4xl font-bold mb-1"
                style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}
              >
                {formatCurrency(displayValue)}
              </p>
              <p 
                className="text-xs"
                style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
              >
                {result.recommendedRegime === 'new' ? 'New Regime' : 'Old Regime'}
              </p>
            </div>
            
            {result.savings !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 p-4 rounded-xl"
                style={{
                  background: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <TrendingDown className="h-5 w-5" style={{ color: '#22C55E' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
                    You save {formatCurrency(Math.abs(result.savings))}
                  </p>
                  <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                    by choosing {result.recommendedRegime === 'new' ? 'New' : 'Old'} regime
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Calculator 
              className="h-16 w-16 mx-auto mb-4 opacity-30"
              style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
            />
            <p 
              className="text-sm"
              style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
            >
              Complete all steps to calculate your tax
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Stats */}
      {!result && !isCalculating && (
        <div className="space-y-3 mt-6 pt-6 border-t"
          style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
              Total Income
            </span>
            <span className="text-sm font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
              Deductions
            </span>
            <span className="text-sm font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              {formatCurrency(totalDeductions)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
