'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  Heart,
  Receipt,
  TrendingDown,
  FileText,
  CheckCircle,
  ArrowLeft,
  Calculator,
  Info
} from 'lucide-react'

interface TaxSavingCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  added: boolean
  color: string
  maxSaving?: string
}

export default function TaxSavingsPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [taxSavingSections, setTaxSavingSections] = useState<TaxSavingCard[]>([
    {
      id: 'section-80c',
      title: 'Section 80C Deductions',
      description: 'PPF, ELSS, Life Insurance, Home Loan Principal',
      icon: <Shield className="h-6 w-6" />,
      added: false,
      color: '#16A34A',
      maxSaving: '₹1.5 Lakh'
    },
    {
      id: 'section-80d',
      title: 'Section 80D - Health Insurance',
      description: 'Medical insurance premiums for self and family',
      icon: <Heart className="h-6 w-6" />,
      added: false,
      color: '#DC2626',
      maxSaving: '₹1 Lakh'
    },
    {
      id: 'taxes-paid',
      title: 'Taxes Paid (TDS/TCS)',
      description: 'Upload Form 26AS for automatic TDS credit',
      icon: <Receipt className="h-6 w-6" />,
      added: false,
      color: '#2563EB'
    },
    {
      id: 'carry-forward-losses',
      title: 'Carry Forward Losses',
      description: 'Business losses, capital losses from previous years',
      icon: <TrendingDown className="h-6 w-6" />,
      added: false,
      color: '#7C3AED'
    },
    {
      id: 'other-deductions',
      title: 'Other Deductions',
      description: '80E, 80G, 80TTA, 80TTB and more',
      icon: <FileText className="h-6 w-6" />,
      added: false,
      color: '#EA580C'
    }
  ])

  const [summary, setSummary] = useState({
    totalDeductions: 0,
    totalTaxesPaid: 0,
    estimatedRefund: 0
  })

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      // Check which sections have data
      checkSectionStatus()
      fetchSummary()
    }
  }, [])

  const checkSectionStatus = async () => {
    try {
      const userId = 'default-user'
      const promises = taxSavingSections.map(async (section) => {
        try {
          const response = await fetch(`http://localhost:5000/api/tax-savings/${section.id}?userId=${userId}`)
          return { id: section.id, hasData: response.ok }
        } catch (error) {
          // 404 is expected when no data exists, don't log as error
          if (error.message !== 'Failed to fetch') {
            console.warn(`No data found for ${section.id}`)
          }
          return { id: section.id, hasData: false }
        }
      })

      const results = await Promise.all(promises)
      
      setTaxSavingSections(prev => 
        prev.map(section => ({
          ...section,
          added: results.find(r => r.id === section.id)?.hasData || false
        }))
      )
    } catch (error) {
      console.warn('Some sections may not have data yet:', error.message || error)
    }
  }

  const fetchSummary = async () => {
    if (isFetching) {
      return
    }
    
    setIsFetching(true)
    try {
      const response = await fetch('http://localhost:5000/api/tax-savings/summary?userId=default-user')
      if (response.ok) {
        const data = await response.json()
        setSummary({
          totalDeductions: data.data.totalDeductions || 0,
          totalTaxesPaid: data.data.totalTaxesPaid || 0,
          estimatedRefund: data.data.refundDue || 0
        })
      } else {
        console.error('Failed to fetch summary:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching summary:', error.message || error)
    } finally {
      setIsFetching(false)
    }
  }

  const completedSections = taxSavingSections.filter(section => section.added).length
  const progressPercentage = (completedSections / taxSavingSections.length) * 100

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: theme === 'dark'
        ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
        : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)'
    }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl transition-colors"
              style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #16A34A, #06B6D4)'
                }}>
                  Tax Saving & Deductions
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Maximize your tax savings with eligible deductions
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))'
                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.15)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                Completion Progress
              </h3>
              <span className="text-sm font-medium" style={{
                color: theme === 'dark' ? '#16A34A' : '#059669'
              }}>
                {completedSections}/{taxSavingSections.length} sections completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <motion.div
                className="h-3 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                  width: `${progressPercentage}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Deductions
                </p>
                <p className="text-xl font-semibold" style={{ color: '#16A34A' }}>
                  ₹{summary.totalDeductions.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Taxes Paid
                </p>
                <p className="text-xl font-semibold" style={{ color: '#2563EB' }}>
                  ₹{summary.totalTaxesPaid.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Estimated Refund
                </p>
                <p className="text-xl font-semibold" style={{ color: '#059669' }}>
                  ₹{summary.estimatedRefund.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tax Saving Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {taxSavingSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/itr/tax-savings/${section.id}`}
                  className="block h-full rounded-2xl backdrop-blur-md border p-6 transition-all hover:scale-105 hover:shadow-2xl group"
                  style={{
                    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: section.added
                      ? section.color
                      : theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(37, 99, 235, 0.06)',
                    boxShadow: section.added
                      ? `0 0 0 2px ${section.color}20, 0 10px 25px rgba(6, 182, 212, 0.15)`
                      : '0 4px 6px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl transition-all group-hover:scale-110"
                      style={{
                        background: `${section.color}20`,
                        color: section.color
                      }}
                    >
                      {section.icon}
                    </div>
                    {section.added && (
                      <CheckCircle className="h-6 w-6" style={{ color: section.color }} />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2" style={{
                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                  }}>
                    {section.title}
                  </h3>
                  
                  <p className="text-sm mb-4" style={{
                    color: theme === 'dark' ? '#94A3B8' : '#64748B'
                  }}>
                    {section.description}
                  </p>

                  {section.maxSaving && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" style={{ color: section.color }} />
                      <span className="text-sm font-medium" style={{ color: section.color }}>
                        Max Saving: {section.maxSaving}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium" style={{
                      color: section.added ? section.color : theme === 'dark' ? '#94A3B8' : '#64748B'
                    }}>
                      {section.added ? 'Added' : 'Add Details'}
                    </span>
                    <div
                      className="w-2 h-2 rounded-full transition-all group-hover:scale-150"
                      style={{
                        background: section.added ? section.color : theme === 'dark' ? '#475569' : '#CBD5E1'
                      }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))'
                : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Info className="h-5 w-5" style={{ color: '#2563EB' }} />
              Important Tax Saving Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Old Tax Regime Benefits
                </h4>
                <ul className="text-sm space-y-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  <li>• Section 80C: Up to ₹1.5 lakh deduction</li>
                  <li>• Section 80D: Up to ₹1 lakh for health insurance</li>
                  <li>• Additional NPS: Extra ₹50,000 under 80CCD(1B)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Filing Requirements
                </h4>
                <ul className="text-sm space-y-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  <li>• File returns on time to carry forward losses</li>
                  <li>• Keep all investment proofs and receipts</li>
                  <li>• Upload Form 26AS for TDS verification</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end gap-4 mt-8"
          >
            <button
              onClick={() => router.push('/tax-summary')}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
              }}
            >
              <Calculator className="h-5 w-5" />
              Continue to Summary
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
