'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import ITRStepper from '../components/ITRStepper'
import { Shield, Receipt, TrendingDown, FileText, Check, Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface DeductionCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  added: boolean
  color: string
}

export default function TaxSavingPage() {
  const { theme } = useTheme()
  const router = useRouter()

  const [deductions, setDeductions] = useState<DeductionCard[]>([
    {
      id: '80c',
      title: 'Section 80C Deductions',
      description: 'PPF, ELSS, Life Insurance, Home Loan Principal',
      icon: <Shield className="h-6 w-6" />,
      added: false,
      color: '#16A34A'
    },
    {
      id: '80d',
      title: 'Section 80D - Health Insurance',
      description: 'Medical insurance premiums for self and family',
      icon: <Shield className="h-6 w-6" />,
      added: false,
      color: '#06B6D4'
    },
    {
      id: 'tds',
      title: 'Taxes Paid (TDS/TCS)',
      description: 'Upload Form 26AS for automatic TDS credit',
      icon: <Receipt className="h-6 w-6" />,
      added: false,
      color: '#2563EB'
    },
    {
      id: 'losses',
      title: 'Carry Forward Losses',
      description: 'Business losses, capital losses from previous years',
      icon: <TrendingDown className="h-6 w-6" />,
      added: false,
      color: '#7C3AED'
    },
    {
      id: 'other',
      title: 'Other Deductions',
      description: '80E, 80G, 80TTA, 80TTB and more',
      icon: <FileText className="h-6 w-6" />,
      added: false,
      color: '#F59E0B'
    }
  ])

  const handleBack = () => {
    router.push('/itr/income-sources')
  }

  const handleContinue = () => {
    router.push('/itr/tax-summary')
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: theme === 'dark'
        ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
        : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)'
    }}>
      <ITRStepper />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent" style={{
            backgroundImage: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)'
          }}>
            Tax Saving & Deductions
          </h1>
          <p className="mb-8" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
            Maximize your tax savings with eligible deductions
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {deductions.map((deduction, index) => (
              <motion.div
                key={deduction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div
                  className="h-full rounded-2xl backdrop-blur-md border p-6 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer group"
                  style={{
                    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: deduction.added
                      ? deduction.color
                      : theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(37, 99, 235, 0.06)',
                    boxShadow: deduction.added
                      ? `0 0 0 2px ${deduction.color}20, 0 10px 25px rgba(6, 182, 212, 0.15)`
                      : '0 10px 25px rgba(6, 182, 212, 0.08)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{
                      background: `linear-gradient(135deg, ${deduction.color}20, ${deduction.color}10)`,
                      color: deduction.color
                    }}>
                      {deduction.icon}
                    </div>
                    {deduction.added && (
                      <div className="p-1 rounded-full" style={{ background: deduction.color }}>
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{
                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                  }}>
                    {deduction.title}
                  </h3>
                  <p className="text-sm mb-4" style={{
                    color: theme === 'dark' ? '#94A3B8' : '#64748B'
                  }}>
                    {deduction.description}
                  </p>
                  <button
                    className="flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: deduction.color }}
                  >
                    <Plus className="h-4 w-4" />
                    {deduction.added ? 'Edit Details' : 'Add Details'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg"
              style={{
                border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`,
                backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(22, 163, 74, 0.05)',
                color: theme === 'dark' ? '#34D399' : '#16A34A'
              }}
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:shadow-2xl hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              Continue to Summary
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
