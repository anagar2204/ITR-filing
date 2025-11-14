'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import ITRStepper from '../components/ITRStepper'
import { CheckCircle, ArrowLeft, FileCheck, TrendingUp, DollarSign, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaxSummary {
  itrType: string
  regime: 'Old' | 'New'
  grossIncome: number
  taxSavings: number
  taxableIncome: number
  totalTax: number
  alreadyPaid: number
  refund: number
}

export default function TaxSummaryPage() {
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
    refund: 13500
  })

  const [animatedRefund, setAnimatedRefund] = useState(0)

  // Animate refund count-up
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = summary.refund / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= summary.refund) {
        setAnimatedRefund(summary.refund)
        clearInterval(timer)
      } else {
        setAnimatedRefund(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [summary.refund])

  const handleBack = () => {
    router.push('/itr/tax-savings')
  }

  const handleEFile = () => {
    alert('E-Filing functionality will be implemented')
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: theme === 'dark'
        ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
        : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)'
    }}>
      <ITRStepper />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))',
              border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(22, 163, 74, 0.25)'}`,
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#16A34A' }} />
              <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                Almost Done!
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent" style={{
              backgroundImage: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)'
            }}>
              Let's finish your ITR filing today!
            </h1>
            <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
              Review your tax summary and file your return
            </p>
          </div>

          {/* Regime Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <RegimeCard
              title="Old Regime"
              tax={85000}
              isSelected={summary.regime === 'Old'}
              theme={theme}
            />
            <RegimeCard
              title="New Regime"
              tax={73500}
              isSelected={summary.regime === 'New'}
              recommended
              theme={theme}
            />
          </div>

          {/* Tax Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Gross Income"
              value={summary.grossIncome}
              color="#16A34A"
              theme={theme}
            />
            <SummaryCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Tax Savings"
              value={summary.taxSavings}
              color="#06B6D4"
              theme={theme}
            />
            <SummaryCard
              icon={<FileCheck className="h-6 w-6" />}
              label="Taxable Income"
              value={summary.taxableIncome}
              color="#2563EB"
              theme={theme}
            />
            <SummaryCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Total Tax"
              value={summary.totalTax}
              color="#7C3AED"
              theme={theme}
            />
            <SummaryCard
              icon={<CheckCircle className="h-6 w-6" />}
              label="Tax Already Paid"
              value={summary.alreadyPaid}
              color="#F59E0B"
              theme={theme}
            />
            <SummaryCard
              icon={<Award className="h-6 w-6" />}
              label="Refund Amount"
              value={animatedRefund}
              color="#10B981"
              highlight
              theme={theme}
            />
          </div>

          {/* ITR Type Info */}
          <div className="rounded-2xl backdrop-blur-md border p-6 mb-8" style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)',
            boxShadow: '0 10px 25px rgba(6, 182, 212, 0.08)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1" style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                }}>
                  Your ITR Type: {summary.itrType}
                </h3>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  For individuals with salary income
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{
                border: `2px solid ${theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
                backgroundColor: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
                color: '#06B6D4'
              }}>
                Double Check Data
              </button>
            </div>
          </div>

          {/* Action Buttons */}
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
              onClick={handleEFile}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:shadow-2xl hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              <FileCheck className="h-5 w-5" />
              E-File ITR Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Reusable Components
interface RegimeCardProps {
  title: string
  tax: number
  isSelected: boolean
  recommended?: boolean
  theme: 'light' | 'dark'
}

function RegimeCard({ title, tax, isSelected, recommended, theme }: RegimeCardProps) {
  return (
    <div
      className="rounded-2xl backdrop-blur-md border p-6 transition-all cursor-pointer hover:scale-105"
      style={{
        background: isSelected
          ? theme === 'dark'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
            : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))'
          : theme === 'dark'
          ? 'rgba(30, 41, 59, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        borderColor: isSelected
          ? '#16A34A'
          : theme === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(37, 99, 235, 0.06)',
        boxShadow: isSelected
          ? '0 0 0 2px rgba(22, 163, 74, 0.2), 0 10px 25px rgba(6, 182, 212, 0.15)'
          : '0 10px 25px rgba(6, 182, 212, 0.08)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg" style={{
          color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
        }}>
          {title}
        </h3>
        {recommended && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
            background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
            color: '#FFFFFF'
          }}>
            Recommended
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-2" style={{
        color: isSelected ? '#16A34A' : theme === 'dark' ? '#FFFFFF' : '#0F172A'
      }}>
        ₹{tax.toLocaleString()}
      </div>
      <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
        Total tax liability
      </p>
    </div>
  )
}

interface SummaryCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  highlight?: boolean
  theme: 'light' | 'dark'
}

function SummaryCard({ icon, label, value, color, highlight, theme }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl backdrop-blur-md border p-6 transition-all hover:scale-105"
      style={{
        background: highlight
          ? theme === 'dark'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))'
            : 'linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(6, 182, 212, 0.1))'
          : theme === 'dark'
          ? 'rgba(30, 41, 59, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        borderColor: highlight
          ? color
          : theme === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(37, 99, 235, 0.06)',
        boxShadow: highlight
          ? `0 0 0 2px ${color}20, 0 10px 25px rgba(6, 182, 212, 0.15)`
          : '0 10px 25px rgba(6, 182, 212, 0.08)'
      }}
    >
      <div className="p-2 rounded-lg inline-block mb-3" style={{
        background: `${color}20`,
        color: color
      }}>
        {icon}
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: highlight ? color : theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
        ₹{value.toLocaleString()}
      </div>
      <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
        {label}
      </p>
    </motion.div>
  )
}
