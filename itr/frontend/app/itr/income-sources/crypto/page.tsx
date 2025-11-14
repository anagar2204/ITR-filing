'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  Bitcoin, 
  Upload, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Save,
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import axios from 'axios'

interface CryptoTransaction {
  transactionId: string
  date: string
  type: 'buy' | 'sell' | 'transfer'
  cryptoType: string
  quantity: number
  rate: number
  amount: number
  fees: number
  exchange: string
}

interface CryptoVDAData {
  transactions: CryptoTransaction[]
  totalGains: number
  totalLoss: number
  tdsDeducted: number
}

export default function CryptoVDAPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<CryptoVDAData>({
    transactions: [{
      transactionId: '',
      date: '',
      type: 'buy',
      cryptoType: 'BTC',
      quantity: 0,
      rate: 0,
      amount: 0,
      fees: 0,
      exchange: ''
    }],
    totalGains: 0,
    totalLoss: 0,
    tdsDeducted: 0
  })

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        transactionId: '',
        date: '',
        type: 'buy',
        cryptoType: 'BTC',
        quantity: 0,
        rate: 0,
        amount: 0,
        fees: 0,
        exchange: ''
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

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/income-sources/crypto-vda', {
        ...formData,
        userId: 'default-user'
      })

      if (response.data.success) {
        alert('Crypto/VDA income saved successfully!')
        router.push('/itr/income-sources')
      }
    } catch (error) {
      console.error('Error saving crypto/VDA income:', error)
      alert('Failed to save crypto/VDA income')
    } finally {
      setLoading(false)
    }
  }

  const calculateNetIncome = () => {
    return formData.totalGains - formData.totalLoss
  }

  const cryptoTypes = ['BTC', 'ETH', 'BNB', 'ADA', 'DOT', 'MATIC', 'SOL', 'DOGE', 'Other']
  const exchanges = ['WazirX', 'CoinDCX', 'Binance', 'Coinbase', 'Kraken', 'Other']

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
                <div className="p-3 rounded-xl" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
                  <Bitcoin className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #F59E0B, #EF4444)'
                }}>
                  Crypto/VDA Income
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Add income from Virtual Digital Assets (Cryptocurrency)
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Important: VDA Tax Rules (FY 2024-25)
                </h3>
                <ul className="text-sm space-y-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  <li>• VDA gains are taxed at 30% flat rate (no indexation benefit)</li>
                  <li>• VDA losses cannot be set off against any other income</li>
                  <li>• 1% TDS is deducted on VDA transactions above ₹10,000</li>
                  <li>• Gifts of VDA above ₹50,000 are taxable in recipient's hands</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Summary Fields */}
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
              VDA Income Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" style={{ color: '#16A34A' }} />
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      Total Gains (₹)
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formData.totalGains || ''}
                    onChange={(e) => handleInputChange('totalGains', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl"
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
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" style={{ color: '#EF4444' }} />
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      Total Loss (₹)
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formData.totalLoss || ''}
                    onChange={(e) => handleInputChange('totalLoss', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl"
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
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4" style={{ color: '#F59E0B' }} />
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      TDS Deducted (₹)
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formData.tdsDeducted || ''}
                    onChange={(e) => handleInputChange('tdsDeducted', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                    }}
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* Transaction Details */}
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
                Transaction Details (Optional)
              </h3>
              <button
                onClick={addTransaction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
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
                          Transaction ID
                        </span>
                        <input
                          type="text"
                          value={transaction.transactionId}
                          onChange={(e) => handleTransactionChange(index, 'transactionId', e.target.value)}
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
                          Type
                        </span>
                        <select
                          value={transaction.type}
                          onChange={(e) => handleTransactionChange(index, 'type', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                          <option value="transfer">Transfer</option>
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Crypto Type
                        </span>
                        <select
                          value={transaction.cryptoType}
                          onChange={(e) => handleTransactionChange(index, 'cryptoType', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          {cryptoTypes.map(crypto => (
                            <option key={crypto} value={crypto}>{crypto}</option>
                          ))}
                        </select>
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
                          step="0.00000001"
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
                          Exchange
                        </span>
                        <select
                          value={transaction.exchange}
                          onChange={(e) => handleTransactionChange(index, 'exchange', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          <option value="">Select Exchange</option>
                          {exchanges.map(exchange => (
                            <option key={exchange} value={exchange}>{exchange}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Fees (₹)
                        </span>
                        <input
                          type="number"
                          value={transaction.fees || ''}
                          onChange={(e) => handleTransactionChange(index, 'fees', parseFloat(e.target.value) || 0)}
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
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#F59E0B' }} />
              VDA Income Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Net VDA Income
                </p>
                <p className="text-xl font-semibold" style={{ 
                  color: calculateNetIncome() >= 0 ? '#16A34A' : '#EF4444' 
                }}>
                  ₹{calculateNetIncome().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Tax @ 30% (Estimated)
                </p>
                <p className="text-xl font-semibold" style={{ color: '#F59E0B' }}>
                  ₹{Math.max(0, calculateNetIncome() * 0.3).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #F59E0B, #EF4444)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Crypto/VDA Income'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
