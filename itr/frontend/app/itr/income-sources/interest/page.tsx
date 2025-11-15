'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Upload, 
  Building2, 
  CreditCard,
  ArrowLeft,
  Save,
  Calculator,
  Plus,
  Trash2,
  PiggyBank
} from 'lucide-react'
import axios from 'axios'

interface BankDetail {
  bankName: string
  accountNumber: string
  interestEarned: number
  tdsDeducted: number
}

interface InterestIncomeData {
  savingsAccountInterest: number
  fixedDepositInterest: number
  recurringDepositInterest: number
  bondInterest: number
  otherInterest: number
  tdsOnInterest: number
  bankDetails: BankDetail[]
}

export default function InterestIncomePage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<any>(null)
  
  const [formData, setFormData] = useState<InterestIncomeData>({
    savingsAccountInterest: 0,
    fixedDepositInterest: 0,
    recurringDepositInterest: 0,
    bondInterest: 0,
    otherInterest: 0,
    tdsOnInterest: 0,
    bankDetails: [{
      bankName: '',
      accountNumber: '',
      interestEarned: 0,
      tdsDeducted: 0
    }]
  })

  // Auto-update summary when form data changes
  useEffect(() => {
    const updateSummary = async () => {
      const summary = await getInterestSummary()
      setSummaryData(summary)
    }
    
    // Only update if we have some data
    if (calculateTotalInterest() > 0 || calculateTotalTDS() > 0) {
      updateSummary()
    }
  }, [formData])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBankDetailChange = (index: number, field: string, value: string | number) => {
    const updatedBankDetails = [...formData.bankDetails]
    updatedBankDetails[index] = {
      ...updatedBankDetails[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      bankDetails: updatedBankDetails
    }))
  }

  const addBankDetail = () => {
    setFormData(prev => ({
      ...prev,
      bankDetails: [...prev.bankDetails, {
        bankName: '',
        accountNumber: '',
        interestEarned: 0,
        tdsDeducted: 0
      }]
    }))
  }

  const removeBankDetail = (index: number) => {
    if (formData.bankDetails.length > 1) {
      setFormData(prev => ({
        ...prev,
        bankDetails: prev.bankDetails.filter((_, i) => i !== index)
      }))
    }
  }

  const handleBankStatementUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('bankStatement', file)

      const response = await axios.post('http://localhost:5000/api/income-sources/upload/bank-statement', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        alert('Bank statement uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading bank statement:', error)
      alert('Failed to upload bank statement')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/income-sources/interest', {
        ...formData,
        userId: 'default-user'
      })

      if (response.data.success) {
        alert('Interest income saved successfully!')
        router.push('/itr/income-sources')
      }
    } catch (error) {
      console.error('Error saving interest income:', error)
      alert('Failed to save interest income')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalInterest = () => {
    return formData.savingsAccountInterest + formData.fixedDepositInterest + 
           formData.recurringDepositInterest + formData.bondInterest + formData.otherInterest
  }

  const calculateTotalTDS = () => {
    // Only sum bank-wise TDS, not the separate tdsOnInterest field to avoid double counting
    return formData.bankDetails.reduce((sum, bank) => sum + bank.tdsDeducted, 0)
  }

  const getInterestSummary = async () => {
    try {
      const payload = {
        fiscalYear: '2024-25',
        interest: {
          savings: formData.savingsAccountInterest,
          fd: formData.fixedDepositInterest,
          rd: formData.recurringDepositInterest,
          bonds: formData.bondInterest,
          other: formData.otherInterest
        },
        bankEntries: formData.bankDetails.map(bank => ({
          bankName: bank.bankName,
          interest: bank.interestEarned,
          tdsDeducted: bank.tdsDeducted
        }))
      }

      const response = await axios.post('http://localhost:5000/api/v1/interest-summary', payload)
      return response.data
    } catch (error) {
      console.error('Error getting interest summary:', error)
      return null
    }
  }

  const interestFields = [
    { key: 'savingsAccountInterest', label: 'Savings Account Interest', icon: PiggyBank },
    { key: 'fixedDepositInterest', label: 'Fixed Deposit Interest', icon: Building2 },
    { key: 'recurringDepositInterest', label: 'Recurring Deposit Interest', icon: Building2 },
    { key: 'bondInterest', label: 'Bond Interest', icon: CreditCard },
    { key: 'otherInterest', label: 'Other Interest Income', icon: DollarSign },
    { key: 'tdsOnInterest', label: 'TDS on Interest', icon: Calculator }
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
                <div className="p-3 rounded-xl" style={{ background: '#06B6D420', color: '#06B6D4' }}>
                  <DollarSign className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #06B6D4, #2563EB)'
                }}>
                  Interest Income
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Add interest income from savings, FD, and other sources
              </p>
            </div>
          </div>

          {/* Bank Statement Upload */}
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
              <Upload className="h-5 w-5" style={{ color: '#06B6D4' }} />
              Bank Statement Upload
            </h3>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105 w-fit" style={{
              background: 'linear-gradient(90deg, #06B6D4, #2563EB)',
              color: 'white'
            }}>
              <Upload className="h-4 w-4" />
              Upload Bank Statement
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls"
                onChange={handleBankStatementUpload}
                className="hidden"
              />
            </label>
          </motion.div>

          {/* Interest Income Fields */}
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
            <h3 className="text-lg font-semibold mb-6" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              Interest Income Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {interestFields.map((field) => {
                const Icon = field.icon
                const value = formData[field.key as keyof InterestIncomeData] as number
                
                return (
                  <div key={field.key}>
                    <label className="block">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" style={{ color: '#06B6D4' }} />
                        <span className="text-sm font-medium" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          {field.label}
                        </span>
                      </div>
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

          {/* Bank Details */}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                Bank-wise Interest Details
              </h3>
              <button
                onClick={addBankDetail}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #06B6D4, #2563EB)',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Bank
              </button>
            </div>

            <div className="space-y-6">
              {formData.bankDetails.map((bank, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{
                  background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(248, 250, 252, 0.8)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium" style={{
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                    }}>
                      Bank {index + 1}
                    </h4>
                    {formData.bankDetails.length > 1 && (
                      <button
                        onClick={() => removeBankDetail(index)}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Bank Name
                        </span>
                        <input
                          type="text"
                          value={bank.bankName}
                          onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Account Number
                        </span>
                        <input
                          type="text"
                          value={bank.accountNumber}
                          onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Interest Earned (₹)
                        </span>
                        <input
                          type="number"
                          value={bank.interestEarned || ''}
                          onChange={(e) => handleBankDetailChange(index, 'interestEarned', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          TDS Deducted (₹)
                        </span>
                        <input
                          type="number"
                          value={bank.tdsDeducted || ''}
                          onChange={(e) => handleBankDetailChange(index, 'tdsDeducted', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(37, 99, 235, 0.1))'
                : 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#06B6D4' }} />
              Interest Income Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Interest Income (FY 2024-25)
                </p>
                <p className="text-xl font-semibold" style={{ color: '#06B6D4' }}>
                  ₹{summaryData ? summaryData.totalInterest.toLocaleString('en-IN') : calculateTotalInterest().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total TDS Deducted
                </p>
                <p className="text-xl font-semibold" style={{ color: '#EF4444' }}>
                  ₹{summaryData ? summaryData.totalTDS.toLocaleString('en-IN') : calculateTotalTDS().toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            
            {/* Validation Warning */}
            {summaryData?.validation?.interestMismatch && (
              <div className="mt-4 p-3 rounded-lg border-l-4 border-yellow-500" style={{
                background: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.05)',
                borderColor: '#F59E0B'
              }}>
                <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>
                  ⚠️ Validation Warning
                </p>
                <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Bank interest totals don't match category totals — please verify your entries.
                </p>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #06B6D4, #2563EB)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Interest Income'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
