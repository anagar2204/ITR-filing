'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { TaxResult } from '../page'
import { TrendingDown, ChevronDown, RefreshCw, Award } from 'lucide-react'
import { useState } from 'react'

interface ResultsComparisonProps {
  result: TaxResult
  onReset: () => void
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ResultsComparison({ result, onReset }: ResultsComparisonProps) {
  const { theme } = useTheme()
  const [showOldBreakdown, setShowOldBreakdown] = useState(false)
  const [showNewBreakdown, setShowNewBreakdown] = useState(false)
  
  const regimes = [
    {
      name: 'Old Regime',
      data: result.oldRegime,
      isRecommended: result.recommendedRegime === 'old',
      showBreakdown: showOldBreakdown,
      toggleBreakdown: () => setShowOldBreakdown(!showOldBreakdown),
    },
    {
      name: 'New Regime',
      data: result.newRegime,
      isRecommended: result.recommendedRegime === 'new',
      showBreakdown: showNewBreakdown,
      toggleBreakdown: () => setShowNewBreakdown(!showNewBreakdown),
    },
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-16"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-semibold mb-2"
          style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
        >
          Tax Comparison
        </h2>
        <p 
          className="text-sm"
          style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
        >
          Detailed breakdown of Old vs New tax regime
        </p>
      </div>
      
      {/* Savings Badge */}
      {result.savings !== 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center gap-3 p-6 rounded-2xl mb-8 mx-auto max-w-md"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))'
              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))',
            border: '2px solid rgba(34, 197, 94, 0.4)',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)',
          }}
        >
          <Award className="h-8 w-8" style={{ color: '#22C55E' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}>
              You save
            </p>
            <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>
              {formatCurrency(Math.abs(result.savings))}
            </p>
            <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
              with {result.recommendedRegime === 'new' ? 'New' : 'Old'} Regime
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {regimes.map((regime, index) => (
          <motion.div
            key={regime.name}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="backdrop-blur-md rounded-2xl p-6 border relative overflow-hidden"
            style={{
              background: theme === 'dark'
                ? 'rgba(30, 41, 59, 0.5)'
                : 'rgba(255, 255, 255, 0.85)',
              border: regime.isRecommended
                ? `2px solid ${theme === 'dark' ? '#10B981' : '#16A34A'}`
                : `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)'}`,
              boxShadow: regime.isRecommended
                ? '0 12px 40px rgba(22, 163, 74, 0.15)'
                : theme === 'dark'
                  ? '0 8px 25px rgba(0, 0, 0, 0.3)'
                  : '0 8px 25px rgba(6, 182, 212, 0.06)',
            }}
          >
            {/* Recommended Badge */}
            {regime.isRecommended && (
              <div 
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: theme === 'dark' ? '#10B981' : '#16A34A',
                  color: '#FFFFFF',
                }}
              >
                Recommended
              </div>
            )}
            
            {/* Regime Name */}
            <h3 
              className="text-xl font-semibold mb-6"
              style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
            >
              {regime.name}
            </h3>
            
            {/* Tax Amount */}
            <div className="mb-6">
              <p 
                className="text-sm mb-2"
                style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
              >
                Total Tax Payable
              </p>
              <p 
                className="text-4xl font-bold"
                style={{ 
                  color: regime.isRecommended 
                    ? (theme === 'dark' ? '#10B981' : '#16A34A')
                    : (theme === 'dark' ? '#FFFFFF' : '#0F172A')
                }}
              >
                {formatCurrency(regime.data.netTax)}
              </p>
            </div>
            
            {/* Summary Stats */}
            <div className="space-y-3 mb-6 pb-6 border-b"
              style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)' }}
            >
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>Gross Income</span>
                <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                  {formatCurrency(regime.data.grossIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>Deductions</span>
                <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                  {formatCurrency(regime.data.totalDeductions)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>Taxable Income</span>
                <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                  {formatCurrency(regime.data.taxableIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>Tax Before Cess</span>
                <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                  {formatCurrency(regime.data.taxBeforeCess)}
                </span>
              </div>
              {regime.data.surcharge > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>Surcharge</span>
                  <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                    {formatCurrency(regime.data.surcharge)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>Cess (4%)</span>
                <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                  {formatCurrency(regime.data.cess)}
                </span>
              </div>
              {regime.data.rebate > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#22C55E' }}>Rebate u/s 87A</span>
                  <span style={{ color: '#22C55E' }} className="font-medium">
                    -{formatCurrency(regime.data.rebate)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Slab Breakdown Toggle */}
            <button
              onClick={regime.toggleBreakdown}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300"
              style={{
                background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.1)',
                color: theme === 'dark' ? '#D1D5DB' : '#0F172A',
              }}
            >
              <span className="text-sm font-medium">View Slab Breakdown</span>
              <ChevronDown 
                className="h-4 w-4 transition-transform duration-300"
                style={{
                  transform: regime.showBreakdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            
            {/* Slab Breakdown */}
            {regime.showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-2"
              >
                {regime.data.slabBreakdown.map((slab, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}>
                        {slab.slab}
                      </span>
                      <span className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                        {slab.rate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                        Income: {formatCurrency(slab.income)}
                      </span>
                      <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} className="font-medium">
                        Tax: {formatCurrency(slab.tax)}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Reset Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300"
          style={{
            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.1)',
            color: theme === 'dark' ? '#D1D5DB' : '#475569',
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Calculate Again
        </button>
      </div>
    </motion.div>
  )
}
