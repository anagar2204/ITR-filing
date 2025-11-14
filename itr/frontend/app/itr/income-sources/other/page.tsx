'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  FileText, 
  DollarSign,
  ArrowLeft,
  Save,
  Calculator,
  Plus,
  Trash2,
  Gift,
  Trophy,
  Percent
} from 'lucide-react'
import axios from 'axios'

interface OtherSource {
  description: string
  amount: number
  tdsDeducted: number
}

interface ExemptIncome {
  description: string
  amount: number
  section: string
}

interface OtherIncomeData {
  dividendIncome: number
  winningsFromLottery: number
  winningsFromGames: number
  interestOnRefund: number
  familyPension: number
  otherSources: OtherSource[]
  exemptIncome: ExemptIncome[]
}

export default function OtherIncomePage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<OtherIncomeData>({
    dividendIncome: 0,
    winningsFromLottery: 0,
    winningsFromGames: 0,
    interestOnRefund: 0,
    familyPension: 0,
    otherSources: [{
      description: '',
      amount: 0,
      tdsDeducted: 0
    }],
    exemptIncome: [{
      description: '',
      amount: 0,
      section: ''
    }]
  })

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOtherSourceChange = (index: number, field: string, value: string | number) => {
    const updatedSources = [...formData.otherSources]
    updatedSources[index] = {
      ...updatedSources[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      otherSources: updatedSources
    }))
  }

  const handleExemptIncomeChange = (index: number, field: string, value: string | number) => {
    const updatedExempt = [...formData.exemptIncome]
    updatedExempt[index] = {
      ...updatedExempt[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      exemptIncome: updatedExempt
    }))
  }

  const addOtherSource = () => {
    setFormData(prev => ({
      ...prev,
      otherSources: [...prev.otherSources, {
        description: '',
        amount: 0,
        tdsDeducted: 0
      }]
    }))
  }

  const removeOtherSource = (index: number) => {
    if (formData.otherSources.length > 1) {
      setFormData(prev => ({
        ...prev,
        otherSources: prev.otherSources.filter((_, i) => i !== index)
      }))
    }
  }

  const addExemptIncome = () => {
    setFormData(prev => ({
      ...prev,
      exemptIncome: [...prev.exemptIncome, {
        description: '',
        amount: 0,
        section: ''
      }]
    }))
  }

  const removeExemptIncome = (index: number) => {
    if (formData.exemptIncome.length > 1) {
      setFormData(prev => ({
        ...prev,
        exemptIncome: prev.exemptIncome.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/income-sources/other', {
        ...formData,
        userId: 'default-user'
      })

      if (response.data.success) {
        alert('Other income saved successfully!')
        router.push('/itr/income-sources')
      }
    } catch (error) {
      console.error('Error saving other income:', error)
      alert('Failed to save other income')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalTaxableIncome = () => {
    const fixedIncome = formData.dividendIncome + formData.winningsFromLottery + 
                       formData.winningsFromGames + formData.interestOnRefund + formData.familyPension
    const otherSourcesTotal = formData.otherSources.reduce((sum, source) => sum + source.amount, 0)
    return fixedIncome + otherSourcesTotal
  }

  const calculateTotalTDS = () => {
    return formData.otherSources.reduce((sum, source) => sum + source.tdsDeducted, 0)
  }

  const fixedIncomeFields = [
    { key: 'dividendIncome', label: 'Dividend Income', icon: Gift, description: 'Dividend from shares, mutual funds' },
    { key: 'winningsFromLottery', label: 'Winnings from Lottery', icon: Trophy, description: 'Lottery, crossword puzzles, races' },
    { key: 'winningsFromGames', label: 'Winnings from Games', icon: Trophy, description: 'Card games, other games of any sort' },
    { key: 'interestOnRefund', label: 'Interest on Tax Refund', icon: Percent, description: 'Interest received on income tax refund' },
    { key: 'familyPension', label: 'Family Pension', icon: DollarSign, description: 'Pension received by family members' }
  ]

  const exemptSections = [
    '10(1)', '10(2)', '10(3)', '10(4)', '10(5)', '10(6)', '10(7)', '10(8)', '10(9)', '10(10)',
    '10(11)', '10(12)', '10(13)', '10(14)', '10(15)', '10(16)', '10(17)', '10(18)', '10(19)', '10(20)',
    '10(21)', '10(22)', '10(23)', '10(24)', '10(25)', '10(26)', '10(27)', '10(28)', '10(29)', '10(30)',
    '10(31)', '10(32)', '10(33)', '10(34)', '10(35)', '10(36)', '10(37)', '10(38)', '10(39)', '10(40)',
    '10(41)', '10(42)', '10(43)', '10(44)', '10(45)', '10(46)', '10(47)', '10(48)', '10(49)', '10(50)'
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
                <div className="p-3 rounded-xl" style={{ background: '#EF444420', color: '#EF4444' }}>
                  <FileText className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #EF4444, #F97316)'
                }}>
                  Other Income
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Add dividend, winnings, and other miscellaneous income
              </p>
            </div>
          </div>

          {/* Fixed Income Sources */}
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
            <h3 className="text-lg font-semibold mb-6" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              Standard Other Income Sources
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {fixedIncomeFields.map((field) => {
                const Icon = field.icon
                const value = formData[field.key as keyof OtherIncomeData] as number
                
                return (
                  <div key={field.key}>
                    <label className="block">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" style={{ color: '#EF4444' }} />
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

          {/* Other Sources */}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                Additional Income Sources
              </h3>
              <button
                onClick={addOtherSource}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #EF4444, #F97316)',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Source
              </button>
            </div>

            <div className="space-y-6">
              {formData.otherSources.map((source, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{
                  background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(248, 250, 252, 0.8)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium" style={{
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                    }}>
                      Income Source {index + 1}
                    </h4>
                    {formData.otherSources.length > 1 && (
                      <button
                        onClick={() => removeOtherSource(index)}
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
                          Description
                        </span>
                        <input
                          type="text"
                          value={source.description}
                          onChange={(e) => handleOtherSourceChange(index, 'description', e.target.value)}
                          placeholder="e.g., Freelance income, Consultancy"
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
                          value={source.amount || ''}
                          onChange={(e) => handleOtherSourceChange(index, 'amount', parseFloat(e.target.value) || 0)}
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
                          value={source.tdsDeducted || ''}
                          onChange={(e) => handleOtherSourceChange(index, 'tdsDeducted', parseFloat(e.target.value) || 0)}
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

          {/* Exempt Income */}
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
                Exempt Income (Section 10)
              </h3>
              <button
                onClick={addExemptIncome}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Exempt Income
              </button>
            </div>

            <div className="space-y-6">
              {formData.exemptIncome.map((exempt, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{
                  background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(248, 250, 252, 0.8)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium" style={{
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                    }}>
                      Exempt Income {index + 1}
                    </h4>
                    {formData.exemptIncome.length > 1 && (
                      <button
                        onClick={() => removeExemptIncome(index)}
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
                          Description
                        </span>
                        <input
                          type="text"
                          value={exempt.description}
                          onChange={(e) => handleExemptIncomeChange(index, 'description', e.target.value)}
                          placeholder="e.g., Agricultural income, HRA exemption"
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
                          value={exempt.amount || ''}
                          onChange={(e) => handleExemptIncomeChange(index, 'amount', parseFloat(e.target.value) || 0)}
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
                          Section
                        </span>
                        <select
                          value={exempt.section}
                          onChange={(e) => handleExemptIncomeChange(index, 'section', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          <option value="">Select Section</option>
                          {exemptSections.map(section => (
                            <option key={section} value={section}>Section {section}</option>
                          ))}
                        </select>
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
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#EF4444' }} />
              Other Income Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Taxable Other Income
                </p>
                <p className="text-xl font-semibold" style={{ color: '#EF4444' }}>
                  ₹{calculateTotalTaxableIncome().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total TDS Deducted
                </p>
                <p className="text-xl font-semibold" style={{ color: '#16A34A' }}>
                  ₹{calculateTotalTDS().toLocaleString('en-IN')}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #EF4444, #F97316)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Other Income'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
