'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  Receipt, 
  Upload, 
  ArrowLeft,
  Save,
  Calculator,
  FileText,
  CreditCard,
  Building,
  Plus,
  Trash2
} from 'lucide-react'
import axios from 'axios'

interface TDSEntry {
  deductorName: string
  deductorTAN: string
  transactionDate: string
  amount: number
  tdsAmount: number
  type: 'TDS' | 'TCS' | 'ADVANCE_TAX'
  section: string
}

interface TaxesPaidData {
  tdsOnSalary: number
  tdsOnInterest: number
  tdsOnDividend: number
  tdsOnRent: number
  tdsOnProfessionalFees: number
  tdsOnCommission: number
  tdsOnOthers: number
  tcsOnSaleOfGoods: number
  tcsOnForeignRemittance: number
  tcsOnMotorVehicle: number
  tcsOnOthers: number
  advanceTaxPaid: number
  selfAssessmentTax: number
  form26ASData: TDSEntry[]
}

export default function TaxesPaidPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<TaxesPaidData>({
    tdsOnSalary: 0,
    tdsOnInterest: 0,
    tdsOnDividend: 0,
    tdsOnRent: 0,
    tdsOnProfessionalFees: 0,
    tdsOnCommission: 0,
    tdsOnOthers: 0,
    tcsOnSaleOfGoods: 0,
    tcsOnForeignRemittance: 0,
    tcsOnMotorVehicle: 0,
    tcsOnOthers: 0,
    advanceTaxPaid: 0,
    selfAssessmentTax: 0,
    form26ASData: [{
      deductorName: '',
      deductorTAN: '',
      transactionDate: '',
      amount: 0,
      tdsAmount: 0,
      type: 'TDS',
      section: ''
    }]
  })

  useEffect(() => {
    // Load existing data when component mounts
    const loadExistingData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tax-savings/taxes-paid?userId=default-user')
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

  const handleTDSEntryChange = (index: number, field: string, value: string | number) => {
    const updatedEntries = [...formData.form26ASData]
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      form26ASData: updatedEntries
    }))
  }

  const addTDSEntry = () => {
    setFormData(prev => ({
      ...prev,
      form26ASData: [...prev.form26ASData, {
        deductorName: '',
        deductorTAN: '',
        transactionDate: '',
        amount: 0,
        tdsAmount: 0,
        type: 'TDS',
        section: ''
      }]
    }))
  }

  const removeTDSEntry = (index: number) => {
    if (formData.form26ASData.length > 1) {
      setFormData(prev => ({
        ...prev,
        form26ASData: prev.form26ASData.filter((_, i) => i !== index)
      }))
    }
  }

  const handleForm26ASUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('form26AS', file)

      const response = await axios.post('http://localhost:5000/api/tax-savings/upload/form26as', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        alert('Form 26AS uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading Form 26AS:', error)
      alert('Failed to upload Form 26AS')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/tax-savings/taxes-paid', {
        ...formData,
        userId: 'default-user',
        documents: []
      })

      if (response.data.success) {
        alert('Taxes paid data saved successfully!')
        router.push('/itr/tax-savings')
      }
    } catch (error) {
      console.error('Error saving taxes paid data:', error)
      alert('Failed to save taxes paid data')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalTDS = () => {
    return formData.tdsOnSalary + formData.tdsOnInterest + formData.tdsOnDividend + 
           formData.tdsOnRent + formData.tdsOnProfessionalFees + formData.tdsOnCommission + formData.tdsOnOthers
  }

  const calculateTotalTCS = () => {
    return formData.tcsOnSaleOfGoods + formData.tcsOnForeignRemittance + 
           formData.tcsOnMotorVehicle + formData.tcsOnOthers
  }

  const calculateTotalAdvanceTax = () => {
    return formData.advanceTaxPaid + formData.selfAssessmentTax
  }

  const tdsFields = [
    { key: 'tdsOnSalary', label: 'TDS on Salary', section: '192', description: 'Tax deducted by employer' },
    { key: 'tdsOnInterest', label: 'TDS on Interest', section: '194A', description: 'Interest from banks, FDs' },
    { key: 'tdsOnDividend', label: 'TDS on Dividend', section: '194', description: 'Dividend from companies' },
    { key: 'tdsOnRent', label: 'TDS on Rent', section: '194I', description: 'Rent paid to landlord' },
    { key: 'tdsOnProfessionalFees', label: 'TDS on Professional Fees', section: '194J', description: 'Professional/technical services' },
    { key: 'tdsOnCommission', label: 'TDS on Commission', section: '194H', description: 'Commission or brokerage' },
    { key: 'tdsOnOthers', label: 'TDS on Others', section: 'Various', description: 'Other TDS deductions' }
  ]

  const tcsFields = [
    { key: 'tcsOnSaleOfGoods', label: 'TCS on Sale of Goods', section: '206C(1)', description: 'Sale of goods above limit' },
    { key: 'tcsOnForeignRemittance', label: 'TCS on Foreign Remittance', section: '206C(1G)', description: 'Foreign exchange transactions' },
    { key: 'tcsOnMotorVehicle', label: 'TCS on Motor Vehicle', section: '206C(1F)', description: 'Purchase of motor vehicles' },
    { key: 'tcsOnOthers', label: 'TCS on Others', section: 'Various', description: 'Other TCS collections' }
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
                <div className="p-3 rounded-xl" style={{ background: '#2563EB20', color: '#2563EB' }}>
                  <Receipt className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #2563EB, #1D4ED8)'
                }}>
                  Taxes Paid (TDS/TCS)
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Upload Form 26AS for automatic TDS credit
              </p>
            </div>
          </div>

          {/* Form 26AS Upload */}
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
              <FileText className="h-5 w-5" style={{ color: '#2563EB' }} />
              Form 26AS Upload
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105" style={{
                background: 'linear-gradient(90deg, #2563EB, #1D4ED8)',
                color: 'white'
              }}>
                <Upload className="h-4 w-4" />
                Upload Form 26AS
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx"
                  onChange={handleForm26ASUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Upload your Form 26AS to auto-populate TDS details
              </p>
            </div>
          </motion.div>

          {/* TDS Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <CreditCard className="h-5 w-5" style={{ color: '#16A34A' }} />
              Tax Deducted at Source (TDS)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {tdsFields.map((field) => {
                const value = formData[field.key as keyof TaxesPaidData] as number
                
                return (
                  <div key={field.key}>
                    <label className="block">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4" style={{ color: '#16A34A' }} />
                        <span className="text-sm font-medium" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          {field.label}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                        {field.description}
                      </p>
                      <p className="text-xs mb-2 font-medium" style={{ color: '#16A34A' }}>
                        Section {field.section}
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
                          onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
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

          {/* TCS Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Building className="h-5 w-5" style={{ color: '#7C3AED' }} />
              Tax Collected at Source (TCS)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {tcsFields.map((field) => {
                const value = formData[field.key as keyof TaxesPaidData] as number
                
                return (
                  <div key={field.key}>
                    <label className="block">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4" style={{ color: '#7C3AED' }} />
                        <span className="text-sm font-medium" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          {field.label}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                        {field.description}
                      </p>
                      <p className="text-xs mb-2 font-medium" style={{ color: '#7C3AED' }}>
                        Section {field.section}
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
                          onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
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

          {/* Advance Tax Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <CreditCard className="h-5 w-5" style={{ color: '#EA580C' }} />
              Advance Tax & Self Assessment
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4" style={{ color: '#EA580C' }} />
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      Advance Tax Paid
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Tax paid in advance during the year
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                      color: theme === 'dark' ? '#94A3B8' : '#475569'
                    }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={formData.advanceTaxPaid || ''}
                      onChange={(e) => handleInputChange('advanceTaxPaid', parseFloat(e.target.value) || 0)}
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
              <div>
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4" style={{ color: '#EA580C' }} />
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      Self Assessment Tax
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Additional tax paid with return filing
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                      color: theme === 'dark' ? '#94A3B8' : '#475569'
                    }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={formData.selfAssessmentTax || ''}
                      onChange={(e) => handleInputChange('selfAssessmentTax', parseFloat(e.target.value) || 0)}
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
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.1))'
                : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(29, 78, 216, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#2563EB' }} />
              Taxes Paid Summary
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total TDS
                </p>
                <p className="text-xl font-semibold" style={{ color: '#16A34A' }}>
                  ₹{calculateTotalTDS().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total TCS
                </p>
                <p className="text-xl font-semibold" style={{ color: '#7C3AED' }}>
                  ₹{calculateTotalTCS().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Advance Tax
                </p>
                <p className="text-xl font-semibold" style={{ color: '#EA580C' }}>
                  ₹{calculateTotalAdvanceTax().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Tax Credit
                </p>
                <p className="text-xl font-semibold" style={{ color: '#2563EB' }}>
                  ₹{(calculateTotalTDS() + calculateTotalTCS() + calculateTotalAdvanceTax()).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #2563EB, #1D4ED8)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Taxes Paid'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
