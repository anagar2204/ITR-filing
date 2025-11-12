'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { TaxFormData } from '../page'
import { Shield, Heart, Landmark, Wallet, Info } from 'lucide-react'
import { useState } from 'react'

interface DeductionsStepProps {
  formData: TaxFormData
  updateFormData: (updates: Partial<TaxFormData>) => void
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DeductionsStep({ formData, updateFormData }: DeductionsStepProps) {
  const { theme } = useTheme()
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const deductionFields = [
    {
      key: 'section80C',
      label: 'Section 80C',
      icon: Shield,
      tooltip: 'PPF, ELSS, Life Insurance, EPF, NSC (Max: ₹1.5L)',
      placeholder: '0',
      limit: 150000,
    },
    {
      key: 'section80D',
      label: 'Section 80D',
      icon: Heart,
      tooltip: 'Health insurance premium for self & family (Max: ₹25K/₹50K)',
      placeholder: '0',
      limit: 50000,
    },
    {
      key: 'section80TTA',
      label: 'Section 80TTA',
      icon: Landmark,
      tooltip: 'Interest on savings account (Max: ₹10K)',
      placeholder: '0',
      limit: 10000,
    },
    {
      key: 'otherDeductions',
      label: 'Other Deductions',
      icon: Wallet,
      tooltip: 'NPS, home loan interest, education loan, etc.',
      placeholder: '0',
      limit: null,
    },
  ]
  
  const handleInputChange = (key: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value.replace(/,/g, ''))
    if (!isNaN(numValue) && numValue >= 0) {
      updateFormData({ [key]: numValue })
    }
  }
  
  const totalDeductions = formData.section80C + formData.section80D + formData.section80TTA + formData.otherDeductions
  const stdDeduction = formData.fy === '2025-26' ? 75000 : 50000
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 
        className="text-2xl font-semibold mb-2"
        style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
      >
        Tax Deductions
      </h2>
      <p 
        className="text-sm mb-8"
        style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
      >
        Enter your tax-saving investments and deductions (Old Regime only)
      </p>
      
      {/* Standard Deduction Notice */}
      <div 
        className="mb-6 p-4 rounded-xl"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))'
            : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.08))',
          border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 163, 74, 0.15)'}`,
        }}
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
          <div>
            <p 
              className="text-sm font-medium mb-1"
              style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}
            >
              Standard Deduction: {formatCurrency(stdDeduction)}
            </p>
            <p 
              className="text-xs"
              style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
            >
              Automatically applied to both regimes. New regime (FY 2025-26) allows only standard deduction.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {deductionFields.map((field, index) => {
          const Icon = field.icon
          const value = formData[field.key as keyof TaxFormData] as number
          const exceedsLimit = field.limit && value > field.limit
          
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <label className="block">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="h-4 w-4" 
                      style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} 
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
                    >
                      {field.label}
                      {field.limit && (
                        <span 
                          className="ml-2 text-xs"
                          style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                        >
                          (Max: {formatCurrency(field.limit)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="group relative">
                    <Info className="h-4 w-4 cursor-help" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }} />
                    <div 
                      className="absolute right-0 top-6 w-64 p-3 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                      style={{
                        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                        color: theme === 'dark' ? '#D1D5DB' : '#475569',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {field.tooltip}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <span 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                  >
                    ₹
                  </span>
                  <input
                    type="text"
                    value={value === 0 ? '' : value.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={field.placeholder}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 outline-none"
                    style={{
                      background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      border: exceedsLimit
                        ? '2px solid #EF4444'
                        : focusedField === field.key
                          ? `2px solid ${theme === 'dark' ? '#10B981' : '#16A34A'}`
                          : `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
                      boxShadow: focusedField === field.key
                        ? '0 4px 15px rgba(22, 163, 74, 0.15)'
                        : 'none',
                    }}
                  />
                  {exceedsLimit && (
                    <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      Exceeds maximum limit of {formatCurrency(field.limit!)}
                    </p>
                  )}
                </div>
              </label>
            </motion.div>
          )
        })}
      </div>
      
      {/* Total Deductions Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 rounded-xl"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))'
            : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.08))',
          border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 163, 74, 0.15)'}`,
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span 
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
            >
              Total Deductions (Old Regime)
            </span>
            <span 
              className="text-xl font-semibold"
              style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}
            >
              {formatCurrency(totalDeductions + stdDeduction)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs"
            style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
          >
            <span>New Regime Deduction</span>
            <span className="font-medium">{formatCurrency(stdDeduction)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
