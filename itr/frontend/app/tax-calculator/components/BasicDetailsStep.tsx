'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { TaxFormData } from '../page'
import { Calendar, Users, Building2 } from 'lucide-react'
import AgeFilterBox from './AgeFilterBox'
import TaxpayerCategoryFilter from './TaxpayerCategoryFilter'

interface BasicDetailsStepProps {
  formData: TaxFormData
  updateFormData: (updates: Partial<TaxFormData>) => void
}

export default function BasicDetailsStep({ formData, updateFormData }: BasicDetailsStepProps) {
  const { theme } = useTheme()
  
  const financialYears = [
    { value: '2025-26', label: 'FY 2025-26 (AY 2026-27)' },
    { value: '2024-25', label: 'FY 2024-25 (AY 2025-26)' },
  ]
  
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
        Basic Details
      </h2>
      <p 
        className="text-sm mb-8"
        style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
      >
        {formData.taxpayerCategory === 'individual' 
          ? 'Select your taxpayer category, financial year, and age group to get started'
          : 'Select your taxpayer category and financial year to get started'
        }
      </p>
      
      {/* Taxpayer Category Selection */}
      <div className="mb-8">
        <label 
          className="flex items-center gap-2 text-sm font-medium mb-3"
          style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
        >
          <Building2 className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
          Taxpayer Category
        </label>
        <TaxpayerCategoryFilter
          value={formData.taxpayerCategory}
          onChange={(value) => updateFormData({ taxpayerCategory: value })}
          theme={theme}
        />
      </div>
      
      {/* Financial Year Selection */}
      <div className="mb-8">
        <label 
          className="flex items-center gap-2 text-sm font-medium mb-3"
          style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
        >
          <Calendar className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
          Financial Year
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {financialYears.map((fy) => (
            <button
              key={fy.value}
              onClick={() => updateFormData({ fy: fy.value as '2024-25' | '2025-26' })}
              className="p-4 rounded-xl text-left transition-all duration-300 border"
              style={{
                background: formData.fy === fy.value
                  ? theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                    : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))'
                  : theme === 'dark'
                    ? 'rgba(71, 85, 105, 0.2)'
                    : 'rgba(255, 255, 255, 0.5)',
                border: formData.fy === fy.value
                  ? `2px solid ${theme === 'dark' ? '#10B981' : '#16A34A'}`
                  : `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                boxShadow: formData.fy === fy.value
                  ? '0 4px 15px rgba(22, 163, 74, 0.2)'
                  : 'none',
              }}
            >
              <div 
                className="font-semibold"
                style={{ color: formData.fy === fy.value ? (theme === 'dark' ? '#10B981' : '#16A34A') : (theme === 'dark' ? '#FFFFFF' : '#0F172A') }}
              >
                {fy.label}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Age Group Selection - Only for Individual taxpayers */}
      <AnimatePresence mode="wait">
        {formData.taxpayerCategory === 'individual' && (
          <motion.div 
            key="age-group-section"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '2rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <label 
              className="flex items-center gap-2 text-sm font-medium mb-3"
              style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}
            >
              <Users className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
              Age Group
            </label>
            <AgeFilterBox
              value={formData.ageGroup}
              onChange={(value) => updateFormData({ ageGroup: value })}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
