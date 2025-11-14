'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Calculator, Target, CheckCircle, ArrowRight, Lightbulb, DollarSign, PiggyBank, Shield, BookOpen, FileCheck } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import Link from 'next/link'

interface DeductionSuggestion {
  section: string
  title: string
  description: string
  maxLimit: number
  currentAmount: number
  suggestedAmount: number
  potentialSaving: number
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  tips: string[]
}

interface UserProfile {
  grossIncome: number
  currentDeductions: {
    section80C: number
    section80D: number
    section80E: number
    section80G: number
    section80TTA: number
    section80TTB: number
    section80GG: number
    section24B: number
    section80DD: number
    section80DDB: number
    section80U: number
  }
  age: number
  hasParents: boolean
  parentsAge: number
  hasDisability: boolean
  hasHomeLoan: boolean
  isRentPaying: boolean
}

export default function DeductionOptimizerPage() {
  const { theme } = useTheme()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [suggestions, setSuggestions] = useState<DeductionSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPotentialSaving, setTotalPotentialSaving] = useState(0)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user's current income and deduction data
      const [incomeResponse, deductionResponse] = await Promise.all([
        fetch('http://localhost:5000/api/income-sources/salary?userId=default-user'),
        fetch('http://localhost:5000/api/tax-savings/section-80c?userId=default-user')
      ])

      const incomeData = await incomeResponse.json()
      const deductionData = await deductionResponse.json()

      // Create user profile from fetched data
      const salaryData = incomeData.success && incomeData.data.length > 0 ? incomeData.data[0] : null
      const section80CData = deductionData.success ? deductionData.data : null

      const profile: UserProfile = {
        grossIncome: salaryData ? (salaryData.basicSalary + salaryData.hra + salaryData.allowances + salaryData.bonuses) : 800000,
        currentDeductions: {
          section80C: section80CData?.lifeInsurancePremium || 0,
          section80D: 0,
          section80E: 0,
          section80G: 0,
          section80TTA: 0,
          section80TTB: 0,
          section80GG: 0,
          section24B: 0,
          section80DD: 0,
          section80DDB: 0,
          section80U: 0
        },
        age: 30,
        hasParents: true,
        parentsAge: 65,
        hasDisability: false,
        hasHomeLoan: false,
        isRentPaying: true
      }

      setUserProfile(profile)
      generateSuggestions(profile)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // Use default profile
      const defaultProfile: UserProfile = {
        grossIncome: 800000,
        currentDeductions: {
          section80C: 50000,
          section80D: 0,
          section80E: 0,
          section80G: 0,
          section80TTA: 0,
          section80TTB: 0,
          section80GG: 0,
          section24B: 0,
          section80DD: 0,
          section80DDB: 0,
          section80U: 0
        },
        age: 30,
        hasParents: true,
        parentsAge: 65,
        hasDisability: false,
        hasHomeLoan: false,
        isRentPaying: true
      }
      setUserProfile(defaultProfile)
      generateSuggestions(defaultProfile)
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestions = (profile: UserProfile) => {
    const suggestions: DeductionSuggestion[] = []

    // Section 80C Suggestions
    if (profile.currentDeductions.section80C < 150000) {
      const remaining = 150000 - profile.currentDeductions.section80C
      suggestions.push({
        section: '80C',
        title: 'Maximize Section 80C Deductions',
        description: 'Invest in PPF, ELSS, Life Insurance, or EPF to save up to ₹46,800 in taxes',
        maxLimit: 150000,
        currentAmount: profile.currentDeductions.section80C,
        suggestedAmount: 150000,
        potentialSaving: Math.min(remaining * 0.312, 46800), // Assuming 31.2% tax bracket
        priority: 'high',
        icon: <PiggyBank className="h-6 w-6" />,
        tips: [
          'Invest in PPF for long-term wealth creation',
          'Choose ELSS mutual funds for market-linked returns',
          'Increase EPF contribution if employed',
          'Consider life insurance premium payments'
        ]
      })
    }

    // Section 80D Suggestions
    const section80DLimit = profile.age >= 60 ? 50000 : 25000
    const parentsLimit = profile.hasParents && profile.parentsAge >= 60 ? 50000 : 25000
    const totalSection80DLimit = section80DLimit + (profile.hasParents ? parentsLimit : 0)
    
    if (profile.currentDeductions.section80D < totalSection80DLimit) {
      const remaining = totalSection80DLimit - profile.currentDeductions.section80D
      suggestions.push({
        section: '80D',
        title: 'Health Insurance Premium Deductions',
        description: `Save taxes by paying health insurance premiums for yourself${profile.hasParents ? ' and parents' : ''}`,
        maxLimit: totalSection80DLimit,
        currentAmount: profile.currentDeductions.section80D,
        suggestedAmount: totalSection80DLimit,
        potentialSaving: Math.min(remaining * 0.312, remaining * 0.312),
        priority: 'high',
        icon: <Shield className="h-6 w-6" />,
        tips: [
          'Pay health insurance premium for yourself and family',
          profile.hasParents ? 'Include parents in your health insurance policy' : 'Consider adding parents to your policy',
          'Preventive health checkup expenses also qualify',
          'Higher limits available for senior citizens'
        ]
      })
    }

    // Section 80E Suggestions (Education Loan)
    if (profile.age <= 35) {
      suggestions.push({
        section: '80E',
        title: 'Education Loan Interest Deduction',
        description: 'Claim deduction on education loan interest with no upper limit',
        maxLimit: 0, // No limit
        currentAmount: profile.currentDeductions.section80E,
        suggestedAmount: 50000, // Assumed amount
        potentialSaving: 15600, // 50000 * 31.2%
        priority: 'medium',
        icon: <BookOpen className="h-6 w-6" />,
        tips: [
          'No upper limit on deduction amount',
          'Available for 8 years from the year you start repaying',
          'Covers interest paid on education loans for higher studies',
          'Can be claimed by parents, spouse, or student'
        ]
      })
    }

    // Section 80TTA/TTB Suggestions
    const interestLimit = profile.age >= 60 ? 50000 : 10000
    const section = profile.age >= 60 ? '80TTB' : '80TTA'
    
    suggestions.push({
      section,
      title: `${section === '80TTA' ? 'Savings Account' : 'Deposit'} Interest Deduction`,
      description: `Claim deduction on ${section === '80TTA' ? 'savings account' : 'bank deposit'} interest up to ₹${interestLimit.toLocaleString()}`,
      maxLimit: interestLimit,
      currentAmount: profile.currentDeductions[section === '80TTA' ? 'section80TTA' : 'section80TTB'],
      suggestedAmount: interestLimit,
      potentialSaving: interestLimit * 0.312,
      priority: 'low',
      icon: <DollarSign className="h-6 w-6" />,
      tips: [
        `Deduction available on ${section === '80TTA' ? 'savings account' : 'bank/post office deposit'} interest`,
        section === '80TTB' ? 'Higher limit for senior citizens' : 'Keep savings in interest-bearing accounts',
        'Automatically calculated based on your bank statements',
        'No additional investment required'
      ]
    })

    // Section 80G Suggestions (Donations)
    suggestions.push({
      section: '80G',
      title: 'Donation Deductions',
      description: 'Donate to eligible charities and get 50% or 100% deduction',
      maxLimit: 0, // No specific limit, but usually 10% of gross income
      currentAmount: profile.currentDeductions.section80G,
      suggestedAmount: Math.min(profile.grossIncome * 0.1, 50000),
      potentialSaving: Math.min(profile.grossIncome * 0.1, 50000) * 0.312,
      priority: 'low',
      icon: <Target className="h-6 w-6" />,
      tips: [
        'Donate to eligible charitable organizations',
        'Some donations qualify for 100% deduction',
        'Keep proper receipts and certificates',
        'Consider donating to PM CARES Fund or other government funds'
      ]
    })

    setSuggestions(suggestions)
    setTotalPotentialSaving(suggestions.reduce((sum, s) => sum + s.potentialSaving, 0))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#6B7280'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
      case 'medium': return theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'
      case 'low': return theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
      default: return theme === 'dark' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.05)'
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
            Analyzing your tax profile...
          </p>
        </div>
      </div>
    )
  }

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
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))'
              : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.06))',
            border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(22, 163, 74, 0.15)'}`
          }}>
            <TrendingUp className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
            <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}>
              Deduction Optimizer
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent" style={{
            backgroundImage: theme === 'dark'
              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
              : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)'
          }}>
            Maximize Your Tax Savings
          </h1>

          <p className="text-lg max-w-2xl mx-auto" style={{
            color: theme === 'dark' ? '#D1D5DB' : '#475569'
          }}>
            Get personalized suggestions to optimize your deductions and save more on taxes
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
            borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: '#16A34A' }}>
                ₹{totalPotentialSaving.toLocaleString()}
              </div>
              <div className="text-sm" style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                Potential Tax Savings
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                {suggestions.length}
              </div>
              <div className="text-sm" style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                Optimization Opportunities
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: '#06B6D4' }}>
                ₹{userProfile?.grossIncome.toLocaleString()}
              </div>
              <div className="text-sm" style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                Annual Gross Income
              </div>
            </div>
          </div>
        </motion.div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-md border hover:shadow-lg transition-all duration-300"
                style={{
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(148, 163, 184, 0.15)'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{
                      background: getPriorityBg(suggestion.priority),
                      color: getPriorityColor(suggestion.priority)
                    }}>
                      {suggestion.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{
                        color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                      }}>
                        {suggestion.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                          background: getPriorityBg(suggestion.priority),
                          color: getPriorityColor(suggestion.priority)
                        }}>
                          {suggestion.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-xs" style={{
                          color: theme === 'dark' ? '#94A3B8' : '#64748B'
                        }}>
                          Section {suggestion.section}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#16A34A' }}>
                      ₹{suggestion.potentialSaving.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                      Potential Saving
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm mb-4" style={{
                  color: theme === 'dark' ? '#D1D5DB' : '#475569'
                }}>
                  {suggestion.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                      Current: ₹{suggestion.currentAmount.toLocaleString()}
                    </span>
                    <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                      {suggestion.maxLimit > 0 ? `Max: ₹${suggestion.maxLimit.toLocaleString()}` : 'No Limit'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{
                    background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.2)'
                  }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${getPriorityColor(suggestion.priority)}, #06B6D4)`,
                        width: suggestion.maxLimit > 0 
                          ? `${Math.min((suggestion.currentAmount / suggestion.maxLimit) * 100, 100)}%`
                          : '50%'
                      }}
                    />
                  </div>
                </div>

                {/* Tips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4" style={{ color: '#F59E0B' }} />
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                    }}>
                      Tips to maximize savings:
                    </span>
                  </div>
                  {suggestion.tips.slice(0, 2).map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#16A34A' }} />
                      <span className="text-xs" style={{
                        color: theme === 'dark' ? '#94A3B8' : '#64748B'
                      }}>
                        {tip}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/itr/tax-savings" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{
              background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)'
            }}>
              <Target className="h-5 w-5" />
              Start Optimizing Deductions
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link href="/tax-summary" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105" style={{
              border: `2px solid ${theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
              color: '#06B6D4',
              background: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)'
            }}>
              <FileCheck className="h-5 w-5" />
              View Tax Summary
            </Link>
            
            <Link href="/tax-calculator" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105" style={{
              border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`,
              color: theme === 'dark' ? '#34D399' : '#16A34A',
              background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(22, 163, 74, 0.05)'
            }}>
              <Calculator className="h-5 w-5" />
              Calculate Tax Impact
            </Link>
          </div>

          <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
            💡 Tip: Implement these suggestions before March 31st to maximize your tax savings for this financial year
          </p>
        </motion.div>
      </div>
    </div>
  )
}
