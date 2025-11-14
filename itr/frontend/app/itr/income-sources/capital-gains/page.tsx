'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Upload, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Save,
  Calculator,
  Plus,
  Trash2,
  BarChart3,
  FileText
} from 'lucide-react'
import axios from 'axios'

interface Transaction {
  assetType: 'equity' | 'mutual_fund' | 'property' | 'other'
  transactionType: 'buy' | 'sell'
  date: string
  quantity: number
  rate: number
  amount: number
  brokerageCharges: number
  stt: number
  otherCharges: number
}

interface CapitalGainsData {
  shortTermGains: {
    equity: number
    other: number
    totalGains: number
    totalLoss: number
  }
  longTermGains: {
    equity: number
    other: number
    totalGains: number
    totalLoss: number
  }
  transactions: Transaction[]
}

export default function CapitalGainsPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<CapitalGainsData>({
    shortTermGains: {
      equity: 0,
      other: 0,
      totalGains: 0,
      totalLoss: 0
    },
    longTermGains: {
      equity: 0,
      other: 0,
      totalGains: 0,
      totalLoss: 0
    },
    transactions: [{
      assetType: 'equity',
      transactionType: 'buy',
      date: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      brokerageCharges: 0,
      stt: 0,
      otherCharges: 0
    }]
  })

  const handleGainsChange = (section: 'shortTermGains' | 'longTermGains', field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleTransactionChange = (index: number, field: string, value: string | number) => {
    const updatedTransactions = [...formData.transactions]
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      transactions: updatedTransactions
    }))
  }

  const addTransaction = () => {
    setFormData(prev => ({
      ...prev,
      transactions: [...prev.transactions, {
        assetType: 'equity',
        transactionType: 'buy',
        date: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        brokerageCharges: 0,
        stt: 0,
        otherCharges: 0
      }]
    }))
  }

  const removeTransaction = (index: number) => {
    if (formData.transactions.length > 1) {
      setFormData(prev => ({
        ...prev,
        transactions: prev.transactions.filter((_, i) => i !== index)
      }))
    }
  }

  const handleTradingStatementUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('tradingStatement', file)

      const response = await axios.post('http://localhost:5000/api/income-sources/upload/trading-statement', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        alert('Trading statement uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading trading statement:', error)
      alert('Failed to upload trading statement')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/income-sources/capital-gains', {
        ...formData,
        userId: 'default-user'
      })

      if (response.data.success) {
        alert('Capital gains saved successfully!')
        router.push('/itr/income-sources')
      }
    } catch (error) {
      console.error('Error saving capital gains:', error)
      alert('Failed to save capital gains')
    } finally {
      setLoading(false)
    }
  }

  const calculateNetGains = () => {
    const shortTermNet = formData.shortTermGains.totalGains - formData.shortTermGains.totalLoss
    const longTermNet = formData.longTermGains.totalGains - formData.longTermGains.totalLoss
    return { shortTermNet, longTermNet, totalNet: shortTermNet + longTermNet }
  }

  const gainsFields = [
    {
      section: 'Short Term Capital Gains (STCG)',
      key: 'shortTermGains',
      color: '#EF4444',
      fields: [
        { key: 'equity', label: 'Equity STCG', description: 'Gains from equity shares held ≤ 1 year' },
        { key: 'other', label: 'Other STCG', description: 'Gains from other assets held ≤ 3 years' },
        { key: 'totalGains', label: 'Total STCG', description: 'Total short term capital gains' },
        { key: 'totalLoss', label: 'Total STCL', description: 'Total short term capital losses' }
      ]
    },
    {
      section: 'Long Term Capital Gains (LTCG)',
      key: 'longTermGains',
      color: '#16A34A',
      fields: [
        { key: 'equity', label: 'Equity LTCG', description: 'Gains from equity shares held > 1 year' },
        { key: 'other', label: 'Other LTCG', description: 'Gains from other assets held > 3 years' },
        { key: 'totalGains', label: 'Total LTCG', description: 'Total long term capital gains' },
        { key: 'totalLoss', label: 'Total LTCL', description: 'Total long term capital losses' }
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
                <div className="p-3 rounded-xl" style={{ background: '#2563EB20', color: '#2563EB' }}>
                  <TrendingUp className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #2563EB, #7C3AED)'
                }}>
                  Capital Gains
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Add capital gains from stocks, mutual funds, and F&O trading
              </p>
            </div>
          </div>

          {/* Trading Statement Upload */}
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
              Trading Statement Upload
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105" style={{
                background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
                color: 'white'
              }}>
                <Upload className="h-4 w-4" />
                Upload Trading Statement
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls"
                  onChange={handleTradingStatementUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Upload P&L statement from your broker for automatic calculation
              </p>
            </div>
          </motion.div>

          {/* Capital Gains Summary */}
          {gainsFields.map((section, sectionIndex) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
              style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
              }}
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                <BarChart3 className="h-5 w-5" style={{ color: section.color }} />
                {section.section}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {section.fields.map((field) => {
                  const value = formData[section.key as keyof CapitalGainsData][field.key as keyof typeof formData.shortTermGains] as number
                  
                  return (
                    <div key={field.key}>
                      <label className="block">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4" style={{ color: section.color }} />
                          <span className="text-sm font-medium" style={{
                            color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                          }}>
                            {field.label}
                          </span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                          {field.description}
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
                            onChange={(e) => handleGainsChange(section.key as 'shortTermGains' | 'longTermGains', field.key, parseFloat(e.target.value) || 0)}
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
          ))}

          {/* Transaction Details */}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                Transaction Details (Optional)
              </h3>
              <button
                onClick={addTransaction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
            </div>

            <div className="space-y-6">
              {formData.transactions.map((transaction, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{
                  background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(248, 250, 252, 0.8)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium" style={{
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                    }}>
                      Transaction {index + 1}
                    </h4>
                    {formData.transactions.length > 1 && (
                      <button
                        onClick={() => removeTransaction(index)}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Asset Type
                        </span>
                        <select
                          value={transaction.assetType}
                          onChange={(e) => handleTransactionChange(index, 'assetType', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          <option value="equity">Equity</option>
                          <option value="mutual_fund">Mutual Fund</option>
                          <option value="property">Property</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Transaction Type
                        </span>
                        <select
                          value={transaction.transactionType}
                          onChange={(e) => handleTransactionChange(index, 'transactionType', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Date
                        </span>
                        <input
                          type="date"
                          value={transaction.date}
                          onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
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
                          Quantity
                        </span>
                        <input
                          type="number"
                          value={transaction.quantity || ''}
                          onChange={(e) => handleTransactionChange(index, 'quantity', parseFloat(e.target.value) || 0)}
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
                          Rate (₹)
                        </span>
                        <input
                          type="number"
                          value={transaction.rate || ''}
                          onChange={(e) => handleTransactionChange(index, 'rate', parseFloat(e.target.value) || 0)}
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
                          Amount (₹)
                        </span>
                        <input
                          type="number"
                          value={transaction.amount || ''}
                          onChange={(e) => handleTransactionChange(index, 'amount', parseFloat(e.target.value) || 0)}
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
            transition={{ delay: 0.5 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
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
              <Calculator className="h-5 w-5" style={{ color: '#2563EB' }} />
              Capital Gains Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Short Term Net
                </p>
                <p className="text-xl font-semibold" style={{ 
                  color: calculateNetGains().shortTermNet >= 0 ? '#16A34A' : '#EF4444' 
                }}>
                  ₹{calculateNetGains().shortTermNet.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Long Term Net
                </p>
                <p className="text-xl font-semibold" style={{ 
                  color: calculateNetGains().longTermNet >= 0 ? '#16A34A' : '#EF4444' 
                }}>
                  ₹{calculateNetGains().longTermNet.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Net Gains
                </p>
                <p className="text-xl font-semibold" style={{ 
                  color: calculateNetGains().totalNet >= 0 ? '#16A34A' : '#EF4444' 
                }}>
                  ₹{calculateNetGains().totalNet.toLocaleString('en-IN')}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #2563EB, #7C3AED)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Capital Gains'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
