'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Upload, 
  FileText, 
  DollarSign, 
  Building, 
  CreditCard,
  ArrowLeft,
  Save,
  Calculator,
  Info
} from 'lucide-react'
import axios from 'axios'

interface SalaryIncomeData {
  employerName: string
  employerPAN: string
  employerTAN: string
  grossSalary: number
  basicSalary: number
  hra: number
  lta: number
  specialAllowance: number
  otherAllowances: number
  professionalTax: number
  tds: number
  form16Available: boolean
  form16Path?: string
  exemptAllowances: {
    hraExempt: number
    ltaExempt: number
    otherExempt: number
  }
  standardDeduction: number
  entertainmentAllowance: number
}

export default function SalaryIncomePage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingForm16, setUploadingForm16] = useState(false)
  
  const [formData, setFormData] = useState<SalaryIncomeData>({
    employerName: '',
    employerPAN: '',
    employerTAN: '',
    grossSalary: 0,
    basicSalary: 0,
    hra: 0,
    lta: 0,
    specialAllowance: 0,
    otherAllowances: 0,
    professionalTax: 0,
    tds: 0,
    form16Available: false,
    exemptAllowances: {
      hraExempt: 0,
      ltaExempt: 0,
      otherExempt: 0
    },
    standardDeduction: 50000, // Default standard deduction for FY 2024-25
    entertainmentAllowance: 0
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof SalaryIncomeData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleForm16Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingForm16(true)
    try {
      const formData = new FormData()
      formData.append('form16', file)

      const response = await axios.post('http://localhost:5000/api/income-sources/upload/form16', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          form16Available: true,
          form16Path: response.data.data.path
        }))
        alert('Form 16 uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading Form 16:', error)
      alert('Failed to upload Form 16')
    } finally {
      setUploadingForm16(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/income-sources/salary', {
        ...formData,
        userId: 'default-user'
      })

      if (response.data.success) {
        alert('Salary income saved successfully!')
        router.push('/itr/income-sources')
      }
    } catch (error) {
      console.error('Error saving salary income:', error)
      alert('Failed to save salary income')
    } finally {
      setLoading(false)
    }
  }

  const calculateTaxableIncome = () => {
    const { grossSalary, standardDeduction, exemptAllowances, professionalTax } = formData
    return Math.max(0, grossSalary - standardDeduction - exemptAllowances.hraExempt - 
                     exemptAllowances.ltaExempt - exemptAllowances.otherExempt - professionalTax)
  }

  const inputFields = [
    {
      section: 'Employer Details',
      fields: [
        { key: 'employerName', label: 'Employer Name', type: 'text', icon: Building, required: true },
        { key: 'employerPAN', label: 'Employer PAN', type: 'text', icon: CreditCard, required: true },
        { key: 'employerTAN', label: 'Employer TAN', type: 'text', icon: CreditCard, required: false }
      ]
    },
    {
      section: 'Salary Components',
      fields: [
        { key: 'grossSalary', label: 'Gross Salary', type: 'number', icon: DollarSign, required: true },
        { key: 'basicSalary', label: 'Basic Salary', type: 'number', icon: DollarSign, required: true },
        { key: 'hra', label: 'House Rent Allowance (HRA)', type: 'number', icon: DollarSign, required: false },
        { key: 'lta', label: 'Leave Travel Allowance (LTA)', type: 'number', icon: DollarSign, required: false },
        { key: 'specialAllowance', label: 'Special Allowance', type: 'number', icon: DollarSign, required: false },
        { key: 'otherAllowances', label: 'Other Allowances', type: 'number', icon: DollarSign, required: false }
      ]
    },
    {
      section: 'Deductions & Tax',
      fields: [
        { key: 'professionalTax', label: 'Professional Tax', type: 'number', icon: DollarSign, required: false },
        { key: 'tds', label: 'TDS Deducted', type: 'number', icon: DollarSign, required: true },
        { key: 'standardDeduction', label: 'Standard Deduction', type: 'number', icon: Calculator, required: false, disabled: true }
      ]
    },
    {
      section: 'Exempt Allowances',
      fields: [
        { key: 'exemptAllowances.hraExempt', label: 'HRA Exemption', type: 'number', icon: DollarSign, required: false },
        { key: 'exemptAllowances.ltaExempt', label: 'LTA Exemption', type: 'number', icon: DollarSign, required: false },
        { key: 'exemptAllowances.otherExempt', label: 'Other Exemptions', type: 'number', icon: DollarSign, required: false }
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
                <div className="p-3 rounded-xl" style={{ background: '#16A34A20', color: '#16A34A' }}>
                  <Briefcase className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #16A34A, #06B6D4)'
                }}>
                  Salary Income
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Add your salary details from Form 16 or enter manually
              </p>
            </div>
          </div>

          {/* Form 16 Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <FileText className="h-5 w-5" style={{ color: '#16A34A' }} />
              Form 16 Upload
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105" style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                color: 'white'
              }}>
                <Upload className="h-4 w-4" />
                {uploadingForm16 ? 'Uploading...' : 'Upload Form 16'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleForm16Upload}
                  className="hidden"
                  disabled={uploadingForm16}
                />
              </label>
              {formData.form16Available && (
                <span className="text-green-600 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Form 16 uploaded successfully
                </span>
              )}
            </div>
          </motion.div>

          {/* Form Fields */}
          <div className="space-y-8">
            {inputFields.map((section, sectionIndex) => (
              <motion.div
                key={section.section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + sectionIndex * 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-md border"
                style={{
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
                }}
              >
                <h3 className="text-lg font-semibold mb-6" style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                }}>
                  {section.section}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.fields.map((field) => {
                    const Icon = field.icon
                    const value = field.key.includes('.') 
                      ? field.key.split('.').reduce((obj, key) => obj[key], formData as any)
                      : formData[field.key as keyof SalaryIncomeData]
                    
                    return (
                      <div key={field.key}>
                        <label className="block">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4" style={{ color: '#16A34A' }} />
                            <span className="text-sm font-medium" style={{
                              color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                            }}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </div>
                          <div className="relative">
                            {field.type === 'number' && (
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                                color: theme === 'dark' ? '#94A3B8' : '#475569'
                              }}>
                                ₹
                              </span>
                            )}
                            <input
                              type={field.type}
                              value={value || ''}
                              onChange={(e) => handleInputChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                              disabled={field.disabled}
                              className={`w-full ${field.type === 'number' ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 outline-none`}
                              style={{
                                background: field.disabled 
                                  ? theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(148, 163, 184, 0.1)'
                                  : theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
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
            ))}
          </div>

          {/* Calculation Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))'
                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 163, 74, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#16A34A' }} />
              Tax Calculation Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Gross Salary
                </p>
                <p className="text-xl font-semibold" style={{ color: '#16A34A' }}>
                  ₹{formData.grossSalary.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Deductions
                </p>
                <p className="text-xl font-semibold" style={{ color: '#EF4444' }}>
                  ₹{(formData.standardDeduction + formData.exemptAllowances.hraExempt + 
                     formData.exemptAllowances.ltaExempt + formData.exemptAllowances.otherExempt + 
                     formData.professionalTax).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Taxable Income
                </p>
                <p className="text-xl font-semibold" style={{ color: '#2563EB' }}>
                  ₹{calculateTaxableIncome().toLocaleString('en-IN')}
                </p>
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #16A34A, #06B6D4)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Salary Income'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
