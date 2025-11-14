'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  ArrowLeft,
  Save,
  Calculator,
  GraduationCap,
  Heart,
  Home,
  PiggyBank,
  Users,
  Gift
} from 'lucide-react'
import axios from 'axios'

interface OtherDeductionsData {
  section80E: {
    educationLoanInterest: number
    loanDetails: Array<{
      bankName: string
      loanAccountNumber: string
      interestPaid: number
      certificateNumber: string
    }>
  }
  section80G: {
    donations100Percent: number
    donations50Percent: number
    donationDetails: Array<{
      organizationName: string
      organizationPAN: string
      amount: number
      deductionPercentage: number
      receiptNumber: string
      donationDate: string
    }>
  }
  section80GG: {
    rentPaid: number
    landlordName: string
    landlordPAN: string
    cityType: 'metro' | 'non_metro'
    eligibleDeduction: number
  }
  section80TTA: {
    savingsInterest: number
    eligibleDeduction: number
  }
  section80TTB: {
    savingsInterest: number
    eligibleDeduction: number
  }
  section24B: {
    homeLoanInterest: number
    propertyType: 'self_occupied' | 'let_out'
    maxDeduction: number
  }
  section80DD: {
    dependentType: 'normal' | 'severe'
    deductionAmount: number
    dependentDetails: {
      name: string
      relationship: string
      disabilityPercentage: number
      certificateNumber: string
    }
  }
  section80U: {
    disabilityType: 'normal' | 'severe'
    deductionAmount: number
    disabilityPercentage: number
    certificateNumber: string
  }
}

export default function OtherDeductionsPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<OtherDeductionsData>({
    section80E: {
      educationLoanInterest: 0,
      loanDetails: [{
        bankName: '',
        loanAccountNumber: '',
        interestPaid: 0,
        certificateNumber: ''
      }]
    },
    section80G: {
      donations100Percent: 0,
      donations50Percent: 0,
      donationDetails: [{
        organizationName: '',
        organizationPAN: '',
        amount: 0,
        deductionPercentage: 100,
        receiptNumber: '',
        donationDate: ''
      }]
    },
    section80GG: {
      rentPaid: 0,
      landlordName: '',
      landlordPAN: '',
      cityType: 'metro',
      eligibleDeduction: 0
    },
    section80TTA: {
      savingsInterest: 0,
      eligibleDeduction: 0
    },
    section80TTB: {
      savingsInterest: 0,
      eligibleDeduction: 0
    },
    section24B: {
      homeLoanInterest: 0,
      propertyType: 'self_occupied',
      maxDeduction: 200000
    },
    section80DD: {
      dependentType: 'normal',
      deductionAmount: 75000,
      dependentDetails: {
        name: '',
        relationship: '',
        disabilityPercentage: 0,
        certificateNumber: ''
      }
    },
    section80U: {
      disabilityType: 'normal',
      deductionAmount: 75000,
      disabilityPercentage: 0,
      certificateNumber: ''
    }
  })

  useEffect(() => {
    // Load existing data when component mounts
    const loadExistingData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tax-savings/other-deductions?userId=default-user')
        if (response.data.success && response.data.data) {
          setFormData(response.data.data)
        }
      } catch (error) {
        console.log('No existing data found or error loading data:', error)
      }
    }
    
    loadExistingData()
  }, [])

  const handleSectionChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof OtherDeductionsData],
        [field]: value
      }
    }))
  }

  const handleNestedChange = (section: string, subSection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof OtherDeductionsData],
        [subSection]: {
          ...(prev[section as keyof OtherDeductionsData] as any)[subSection],
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Calculate auto deductions
      const updatedData = { ...formData }
      
      // Section 80TTA calculation (max 10,000 for below 60)
      updatedData.section80TTA.eligibleDeduction = Math.min(updatedData.section80TTA.savingsInterest, 10000)
      
      // Section 80TTB calculation (max 50,000 for senior citizens)
      updatedData.section80TTB.eligibleDeduction = Math.min(updatedData.section80TTB.savingsInterest, 50000)
      
      // Section 80GG calculation
      const rentLimit = updatedData.section80GG.cityType === 'metro' ? 60000 : 48000
      updatedData.section80GG.eligibleDeduction = Math.min(updatedData.section80GG.rentPaid, rentLimit)

      const response = await axios.post('http://localhost:5000/api/tax-savings/other-deductions', {
        ...updatedData,
        userId: 'default-user',
        documents: []
      })

      if (response.data.success) {
        alert('Other deductions saved successfully!')
        router.push('/itr/tax-savings')
      }
    } catch (error) {
      console.error('Error saving other deductions:', error)
      alert('Failed to save other deductions')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalDeductions = () => {
    return formData.section80E.educationLoanInterest +
           (formData.section80G.donations100Percent + formData.section80G.donations50Percent * 0.5) +
           formData.section80GG.eligibleDeduction +
           formData.section80TTA.eligibleDeduction +
           formData.section80TTB.eligibleDeduction +
           Math.min(formData.section24B.homeLoanInterest, formData.section24B.maxDeduction) +
           formData.section80DD.deductionAmount +
           formData.section80U.deductionAmount
  }

  const deductionSections = [
    {
      id: 'section80E',
      title: 'Section 80E - Education Loan Interest',
      icon: GraduationCap,
      color: '#2563EB',
      description: 'Interest on education loan (no limit)',
      fields: [
        { key: 'educationLoanInterest', label: 'Education Loan Interest', type: 'number' }
      ]
    },
    {
      id: 'section80G',
      title: 'Section 80G - Donations',
      icon: Gift,
      color: '#16A34A',
      description: 'Donations to eligible organizations',
      fields: [
        { key: 'donations100Percent', label: '100% Deduction Donations', type: 'number' },
        { key: 'donations50Percent', label: '50% Deduction Donations', type: 'number' }
      ]
    },
    {
      id: 'section80GG',
      title: 'Section 80GG - House Rent',
      icon: Home,
      color: '#7C3AED',
      description: 'House rent (if HRA not received)',
      fields: [
        { key: 'rentPaid', label: 'Annual Rent Paid', type: 'number' },
        { key: 'landlordName', label: 'Landlord Name', type: 'text' },
        { key: 'landlordPAN', label: 'Landlord PAN', type: 'text' }
      ]
    },
    {
      id: 'section80TTA',
      title: 'Section 80TTA - Savings Interest',
      icon: PiggyBank,
      color: '#059669',
      description: 'Interest on savings account (below 60 years)',
      fields: [
        { key: 'savingsInterest', label: 'Savings Account Interest', type: 'number', max: 10000 }
      ]
    },
    {
      id: 'section80TTB',
      title: 'Section 80TTB - Senior Citizen Interest',
      icon: Users,
      color: '#DC2626',
      description: 'Interest on savings account (senior citizens)',
      fields: [
        { key: 'savingsInterest', label: 'Savings Account Interest', type: 'number', max: 50000 }
      ]
    },
    {
      id: 'section24B',
      title: 'Section 24B - Home Loan Interest',
      icon: Home,
      color: '#EA580C',
      description: 'Interest on home loan',
      fields: [
        { key: 'homeLoanInterest', label: 'Home Loan Interest', type: 'number', max: 200000 }
      ]
    },
    {
      id: 'section80DD',
      title: 'Section 80DD - Disabled Dependent',
      icon: Heart,
      color: '#EC4899',
      description: 'Expenses for disabled dependent',
      fields: [
        { key: 'dependentType', label: 'Disability Type', type: 'select', options: [
          { value: 'normal', label: 'Normal (₹75,000)' },
          { value: 'severe', label: 'Severe (₹1,25,000)' }
        ]}
      ]
    },
    {
      id: 'section80U',
      title: 'Section 80U - Self Disability',
      icon: Users,
      color: '#8B5CF6',
      description: 'Self disability deduction',
      fields: [
        { key: 'disabilityType', label: 'Disability Type', type: 'select', options: [
          { value: 'normal', label: 'Normal (₹75,000)' },
          { value: 'severe', label: 'Severe (₹1,25,000)' }
        ]}
      ]
    }
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
                <div className="p-3 rounded-xl" style={{ background: '#EA580C20', color: '#EA580C' }}>
                  <FileText className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #EA580C, #F97316)'
                }}>
                  Other Deductions
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Additional tax deductions under various sections
              </p>
            </div>
          </div>

          {/* Deduction Sections */}
          {deductionSections.map((section, sectionIndex) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + sectionIndex * 0.1 }}
                className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
                style={{
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                }}>
                  <Icon className="h-5 w-5" style={{ color: section.color }} />
                  {section.title}
                </h3>
                <p className="text-sm mb-6" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  {section.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {section.fields.map((field) => {
                    const sectionKey = section.id as keyof OtherDeductionsData
                    const value = (formData[sectionKey] as any)[field.key]
                    
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
                          {field.max && (
                            <p className="text-xs mb-2" style={{ color: section.color }}>
                              Maximum: ₹{field.max.toLocaleString('en-IN')}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              {field.type === 'select' ? (
                                <select
                                  value={value || ''}
                                  onChange={(e) => handleSectionChange(section.id, field.key, e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl"
                                  style={{
                                    background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                                  }}
                                >
                                  {field.options?.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === 'number' ? (
                                <>
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                                    color: theme === 'dark' ? '#94A3B8' : '#475569'
                                  }}>
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    value={value || ''}
                                    onChange={(e) => handleSectionChange(section.id, field.key, parseFloat(e.target.value) || 0)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 outline-none"
                                    style={{
                                      background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                                      border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                                    }}
                                  />
                                </>
                              ) : (
                                <input
                                  type="text"
                                  value={value || ''}
                                  onChange={(e) => handleSectionChange(section.id, field.key, e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 outline-none"
                                  style={{
                                    background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                                  }}
                                />
                              )}
                            </div>
                            {field.type === 'number' && (
                              <label className="flex items-center justify-center px-3 py-3 rounded-xl cursor-pointer transition-all hover:scale-105" style={{
                                background: `${section.color}20`,
                                color: section.color
                              }}>
                                <Upload className="h-4 w-4" />
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(249, 115, 22, 0.1))'
                : 'linear-gradient(135deg, rgba(234, 88, 12, 0.08), rgba(249, 115, 22, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(234, 88, 12, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#EA580C' }} />
              Other Deductions Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Other Deductions
                </p>
                <p className="text-xl font-semibold" style={{ color: '#EA580C' }}>
                  ₹{calculateTotalDeductions().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Estimated Tax Saving (30%)
                </p>
                <p className="text-xl font-semibold" style={{ color: '#16A34A' }}>
                  ₹{(calculateTotalDeductions() * 0.3).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #EA580C, #F97316)',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Other Deductions'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
