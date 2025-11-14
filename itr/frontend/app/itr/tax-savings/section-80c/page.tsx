'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Upload, 
  DollarSign,
  ArrowLeft,
  Save,
  Calculator,
  PiggyBank,
  Home,
  GraduationCap,
  Building,
  FileText,
  TrendingUp
} from 'lucide-react'
import axios from 'axios'

interface Section80CData {
  lifeInsurancePremium: number
  epfContribution: number
  vpfContribution: number
  ppfContribution: number
  elssInvestment: number
  nscInvestment: number
  taxSaverFD: number
  sukanyaSamriddhiYojana: number
  homeLoanPrincipal: number
  tuitionFees: number
  ulipPremium: number
  pensionFundContribution: number
  infrastructureBonds: number
  section80CCC: number
  section80CCD1: number
  section80CCD1B: number
  maxLimit: number
  additionalNPSLimit: number
}

export default function Section80CPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<Section80CData>({
    lifeInsurancePremium: 0,
    epfContribution: 0,
    vpfContribution: 0,
    ppfContribution: 0,
    elssInvestment: 0,
    nscInvestment: 0,
    taxSaverFD: 0,
    sukanyaSamriddhiYojana: 0,
    homeLoanPrincipal: 0,
    tuitionFees: 0,
    ulipPremium: 0,
    pensionFundContribution: 0,
    infrastructureBonds: 0,
    section80CCC: 0,
    section80CCD1: 0,
    section80CCD1B: 0,
    maxLimit: 150000,
    additionalNPSLimit: 50000
  })

  useEffect(() => {
    // Load existing data when component mounts
    const loadExistingData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tax-savings/section-80c?userId=default-user')
        if (response.data.success && response.data.data) {
          setFormData(response.data.data)
        }
      } catch (error) {
        console.log('No existing data found or error loading data:', error)
      }
    }
    
    loadExistingData()
  }, [])

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('investmentProof', file)

      const response = await axios.post('http://localhost:5000/api/tax-savings/upload/investment-proof', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        alert(`${type} proof uploaded successfully!`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/tax-savings/section-80c', {
        ...formData,
        userId: 'default-user',
        documents: []
      })

      if (response.data.success) {
        alert('Section 80C data saved successfully!')
        router.push('/itr/tax-savings')
      }
    } catch (error) {
      console.error('Error saving Section 80C data:', error)
      alert('Failed to save Section 80C data')
    } finally {
      setLoading(false)
    }
  }

  const calculate80CTotal = () => {
    const total = 
      formData.lifeInsurancePremium +
      formData.epfContribution +
      formData.vpfContribution +
      formData.ppfContribution +
      formData.elssInvestment +
      formData.nscInvestment +
      formData.taxSaverFD +
      formData.sukanyaSamriddhiYojana +
      formData.homeLoanPrincipal +
      formData.tuitionFees +
      formData.ulipPremium +
      formData.pensionFundContribution +
      formData.infrastructureBonds +
      formData.section80CCC +
      formData.section80CCD1

    return Math.min(total, formData.maxLimit)
  }

  const calculateTotalDeduction = () => {
    return calculate80CTotal() + Math.min(formData.section80CCD1B, formData.additionalNPSLimit)
  }

  const calculateTaxSaving = () => {
    return calculateTotalDeduction() * 0.3 // Assuming 30% tax bracket
  }

  const investmentFields = [
    {
      section: 'Life Insurance',
      color: '#DC2626',
      fields: [
        { key: 'lifeInsurancePremium', label: 'Life Insurance Premium', icon: Shield, description: 'Premium paid for life insurance policies' }
      ]
    },
    {
      section: 'Provident Fund',
      color: '#16A34A',
      fields: [
        { key: 'epfContribution', label: 'EPF Contribution', icon: Building, description: 'Employee Provident Fund contribution' },
        { key: 'vpfContribution', label: 'VPF Contribution', icon: Building, description: 'Voluntary Provident Fund contribution' },
        { key: 'ppfContribution', label: 'PPF Contribution', icon: PiggyBank, description: 'Public Provident Fund investment' }
      ]
    },
    {
      section: 'Market Investments',
      color: '#2563EB',
      fields: [
        { key: 'elssInvestment', label: 'ELSS Mutual Funds', icon: TrendingUp, description: 'Equity Linked Savings Scheme investment' },
        { key: 'nscInvestment', label: 'NSC Investment', icon: FileText, description: 'National Savings Certificate' },
        { key: 'taxSaverFD', label: 'Tax Saver FD', icon: PiggyBank, description: '5-year tax saving fixed deposit' }
      ]
    },
    {
      section: 'Government Schemes',
      color: '#7C3AED',
      fields: [
        { key: 'sukanyaSamriddhiYojana', label: 'Sukanya Samriddhi Yojana', icon: GraduationCap, description: 'Girl child savings scheme' },
        { key: 'infrastructureBonds', label: 'Infrastructure Bonds', icon: Building, description: 'Investment in infrastructure bonds' }
      ]
    },
    {
      section: 'Loans & Education',
      color: '#EA580C',
      fields: [
        { key: 'homeLoanPrincipal', label: 'Home Loan Principal', icon: Home, description: 'Principal repayment of home loan' },
        { key: 'tuitionFees', label: 'Tuition Fees', icon: GraduationCap, description: 'Children education tuition fees' }
      ]
    },
    {
      section: 'Insurance & Pension',
      color: '#059669',
      fields: [
        { key: 'ulipPremium', label: 'ULIP Premium', icon: Shield, description: 'Unit Linked Insurance Plan premium' },
        { key: 'pensionFundContribution', label: 'Pension Fund', icon: PiggyBank, description: 'Contribution to pension funds' }
      ]
    }
  ]

  const additionalSections = [
    { key: 'section80CCC', label: 'Section 80CCC', description: 'Pension fund contribution', limit: 'Part of ₹1.5L limit' },
    { key: 'section80CCD1', label: 'Section 80CCD(1)', description: 'NPS Tier-1 contribution', limit: 'Part of ₹1.5L limit' },
    { key: 'section80CCD1B', label: 'Section 80CCD(1B)', description: 'Additional NPS contribution', limit: 'Extra ₹50,000' }
  ]

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
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: '#16A34A20', color: '#16A34A' }}>
                  <Shield className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #16A34A, #059669)'
                }}>
                  Section 80C Deductions
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Save up to ₹46,800 in taxes with ₹1.5 lakh investment
              </p>
            </div>
          </div>

          {/* Investment Sections */}
          {investmentFields.map((section, sectionIndex) => (
            <motion.div
              key={section.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + sectionIndex * 0.1 }}
              className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
              style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
              }}
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                <div className="w-4 h-4 rounded-full" style={{ background: section.color }} />
                {section.section}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {section.fields.map((field) => {
                  const Icon = field.icon
                  const value = formData[field.key as keyof Section80CData] as number
                  
                  return (
                    <div key={field.key}>
                      <label className="block">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4" style={{ color: section.color }} />
                          <span className="text-sm font-medium" style={{
                            color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                          }}>
                            {field.label}
                          </span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                          {field.description}
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                              color: theme === 'dark' ? '#94A3B8' : '#475569'
                            }}>
                              ₹
                            </span>
                            <input
                              type="number"
                              value={value || ''}
                              onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 outline-none"
                              style={{
                                background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                              }}
                            />
                          </div>
                          <label className="flex items-center justify-center px-3 py-3 rounded-xl cursor-pointer transition-all hover:scale-105" style={{
                            background: `${section.color}20`,
                            color: section.color
                          }}>
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, field.label)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {/* Additional Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
            }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              Additional Deduction Sections
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {additionalSections.map((section) => {
                const value = formData[section.key as keyof Section80CData] as number
                
                return (
                  <div key={section.key}>
                    <label className="block">
                      <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="h-4 w-4" style={{ color: '#7C3AED' }} />
                        <span className="text-sm font-medium" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          {section.label}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                        {section.description}
                      </p>
                      <p className="text-xs mb-2 font-medium" style={{ color: '#7C3AED' }}>
                        {section.limit}
                      </p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                          color: theme === 'dark' ? '#94A3B8' : '#475569'
                        }}>
                          ₹
                        </span>
                        <input
                          type="number"
                          value={value || ''}
                          onChange={(e) => handleInputChange(section.key, parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 outline-none"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        />
                      </div>
                    </label>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(5, 150, 105, 0.1))'
                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(5, 150, 105, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#16A34A' }} />
              Tax Saving Summary
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Section 80C Deduction
                </p>
                <p className="text-xl font-semibold" style={{ color: '#16A34A' }}>
                  ₹{calculate80CTotal().toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  (Max: ₹1,50,000)
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Additional NPS
                </p>
                <p className="text-xl font-semibold" style={{ color: '#7C3AED' }}>
                  ₹{Math.min(formData.section80CCD1B, formData.additionalNPSLimit).toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  (Max: ₹50,000)
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Deduction
                </p>
                <p className="text-xl font-semibold" style={{ color: '#2563EB' }}>
                  ₹{calculateTotalDeduction().toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  (Max: ₹2,00,000)
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Tax Saving (30%)
                </p>
                <p className="text-xl font-semibold" style={{ color: '#059669' }}>
                  ₹{calculateTaxSaving().toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Estimated saving
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex justify-end gap-4"
          >
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.2)',
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #16A34A, #059669)',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Section 80C'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
