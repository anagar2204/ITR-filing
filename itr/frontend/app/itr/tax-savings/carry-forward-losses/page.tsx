'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  TrendingDown, 
  Upload, 
  ArrowLeft,
  Save,
  Calculator,
  Building,
  Home,
  TrendingUp,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import axios from 'axios'

interface BusinessLoss {
  assessmentYear: string
  lossAmount: number
  remainingAmount: number
  businessType: 'non_speculative' | 'speculative'
  carryForwardYears: number
  returnFiledOnTime: boolean
}

interface CapitalLoss {
  assessmentYear: string
  shortTermLoss: number
  longTermLoss: number
  remainingSTCL: number
  remainingLTCL: number
  carryForwardYears: number
}

interface HousePropertyLoss {
  assessmentYear: string
  lossAmount: number
  remainingAmount: number
  carryForwardYears: number
  applicableInNewRegime: boolean
}

interface UnabsorbedDepreciation {
  assessmentYear: string
  depreciationAmount: number
  remainingAmount: number
  carryForwardYears: number
}

interface CarryForwardLossesData {
  businessLosses: BusinessLoss[]
  capitalLosses: CapitalLoss[]
  housePropertyLosses: HousePropertyLoss[]
  unabsorbedDepreciation: UnabsorbedDepreciation[]
  currentYearSetOff: {
    businessLossSetOff: number
    capitalLossSetOff: number
    housePropertyLossSetOff: number
    depreciationSetOff: number
  }
}

export default function CarryForwardLossesPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<CarryForwardLossesData>({
    businessLosses: [{
      assessmentYear: '2023-24',
      lossAmount: 0,
      remainingAmount: 0,
      businessType: 'non_speculative',
      carryForwardYears: 8,
      returnFiledOnTime: true
    }],
    capitalLosses: [{
      assessmentYear: '2023-24',
      shortTermLoss: 0,
      longTermLoss: 0,
      remainingSTCL: 0,
      remainingLTCL: 0,
      carryForwardYears: 8
    }],
    housePropertyLosses: [{
      assessmentYear: '2023-24',
      lossAmount: 0,
      remainingAmount: 0,
      carryForwardYears: 8,
      applicableInNewRegime: false
    }],
    unabsorbedDepreciation: [{
      assessmentYear: '2023-24',
      depreciationAmount: 0,
      remainingAmount: 0,
      carryForwardYears: 999 // Indefinite
    }],
    currentYearSetOff: {
      businessLossSetOff: 0,
      capitalLossSetOff: 0,
      housePropertyLossSetOff: 0,
      depreciationSetOff: 0
    }
  })

  useEffect(() => {
    // Load existing data when component mounts
    const loadExistingData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tax-savings/carry-forward-losses?userId=default-user')
        if (response.data.success && response.data.data) {
          setFormData(response.data.data)
        }
      } catch (error) {
        console.log('No existing data found or error loading data:', error)
      }
    }
    
    loadExistingData()
  }, [])

  const handleSetOffChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      currentYearSetOff: {
        ...prev.currentYearSetOff,
        [field]: value
      }
    }))
  }

  const handleBusinessLossChange = (index: number, field: string, value: string | number | boolean) => {
    const updatedLosses = [...formData.businessLosses]
    updatedLosses[index] = {
      ...updatedLosses[index],
      [field]: value
    }
    
    // Auto-set carry forward years based on business type
    if (field === 'businessType') {
      updatedLosses[index].carryForwardYears = value === 'speculative' ? 4 : 8
    }
    
    setFormData(prev => ({
      ...prev,
      businessLosses: updatedLosses
    }))
  }

  const handleCapitalLossChange = (index: number, field: string, value: string | number) => {
    const updatedLosses = [...formData.capitalLosses]
    updatedLosses[index] = {
      ...updatedLosses[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      capitalLosses: updatedLosses
    }))
  }

  const addBusinessLoss = () => {
    setFormData(prev => ({
      ...prev,
      businessLosses: [...prev.businessLosses, {
        assessmentYear: '2023-24',
        lossAmount: 0,
        remainingAmount: 0,
        businessType: 'non_speculative',
        carryForwardYears: 8,
        returnFiledOnTime: true
      }]
    }))
  }

  const addCapitalLoss = () => {
    setFormData(prev => ({
      ...prev,
      capitalLosses: [...prev.capitalLosses, {
        assessmentYear: '2023-24',
        shortTermLoss: 0,
        longTermLoss: 0,
        remainingSTCL: 0,
        remainingLTCL: 0,
        carryForwardYears: 8
      }]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/tax-savings/carry-forward-losses', {
        ...formData,
        userId: 'default-user',
        documents: []
      })

      if (response.data.success) {
        alert('Carry forward losses saved successfully!')
        router.push('/itr/tax-savings')
      }
    } catch (error) {
      console.error('Error saving carry forward losses:', error)
      alert('Failed to save carry forward losses')
    } finally {
      setLoading(false)
    }
  }

  const assessmentYears = ['2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18', '2016-17']

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
                <div className="p-3 rounded-xl" style={{ background: '#7C3AED20', color: '#7C3AED' }}>
                  <TrendingDown className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #7C3AED, #A855F7)'
                }}>
                  Carry Forward Losses
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Set off losses from previous years against current income
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
                  Important: Loss Carry Forward Rules
                </h3>
                <ul className="text-sm space-y-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  <li>• Business losses: 8 years (non-speculative), 4 years (speculative)</li>
                  <li>• Capital losses: 8 years (STCL can only set off against STCG/LTCG)</li>
                  <li>• House property losses: 8 years (not allowed in new tax regime)</li>
                  <li>• Unabsorbed depreciation: Indefinite period</li>
                  <li>• Return must be filed on time to carry forward business losses</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Business Losses */}
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
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                <Building className="h-5 w-5" style={{ color: '#2563EB' }} />
                Business Losses (Section 72)
              </h3>
              <button
                onClick={addBusinessLoss}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #2563EB, #1D4ED8)',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Loss
              </button>
            </div>

            <div className="space-y-6">
              {formData.businessLosses.map((loss, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{
                  background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(248, 250, 252, 0.8)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Assessment Year
                        </span>
                        <select
                          value={loss.assessmentYear}
                          onChange={(e) => handleBusinessLossChange(index, 'assessmentYear', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          {assessmentYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Business Type
                        </span>
                        <select
                          value={loss.businessType}
                          onChange={(e) => handleBusinessLossChange(index, 'businessType', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          <option value="non_speculative">Non-Speculative (8 years)</option>
                          <option value="speculative">Speculative (4 years)</option>
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Original Loss Amount (₹)
                        </span>
                        <input
                          type="number"
                          value={loss.lossAmount || ''}
                          onChange={(e) => handleBusinessLossChange(index, 'lossAmount', parseFloat(e.target.value) || 0)}
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
                          Remaining Amount (₹)
                        </span>
                        <input
                          type="number"
                          value={loss.remainingAmount || ''}
                          onChange={(e) => handleBusinessLossChange(index, 'remainingAmount', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={loss.returnFiledOnTime}
                          onChange={(e) => handleBusinessLossChange(index, 'returnFiledOnTime', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Return filed on time
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Capital Losses */}
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
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#EF4444' }} />
                Capital Losses (Section 74)
              </h3>
              <button
                onClick={addCapitalLoss}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #EF4444, #DC2626)',
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Loss
              </button>
            </div>

            <div className="space-y-6">
              {formData.capitalLosses.map((loss, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{
                  background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(248, 250, 252, 0.8)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Assessment Year
                        </span>
                        <select
                          value={loss.assessmentYear}
                          onChange={(e) => handleCapitalLossChange(index, 'assessmentYear', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                            color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                          }}
                        >
                          {assessmentYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium mb-2 block" style={{
                          color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                        }}>
                          Short Term Loss (₹)
                        </span>
                        <input
                          type="number"
                          value={loss.shortTermLoss || ''}
                          onChange={(e) => handleCapitalLossChange(index, 'shortTermLoss', parseFloat(e.target.value) || 0)}
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
                          Long Term Loss (₹)
                        </span>
                        <input
                          type="number"
                          value={loss.longTermLoss || ''}
                          onChange={(e) => handleCapitalLossChange(index, 'longTermLoss', parseFloat(e.target.value) || 0)}
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

          {/* Current Year Set-off */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1))'
                : 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(168, 85, 247, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#7C3AED' }} />
              Current Year Set-off
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block">
                  <span className="text-sm font-medium mb-2 block" style={{
                    color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                  }}>
                    Business Loss Set-off (₹)
                  </span>
                  <input
                    type="number"
                    value={formData.currentYearSetOff.businessLossSetOff || ''}
                    onChange={(e) => handleSetOffChange('businessLossSetOff', parseFloat(e.target.value) || 0)}
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
                  <span className="text-sm font-medium mb-2 block" style={{
                    color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                  }}>
                    Capital Loss Set-off (₹)
                  </span>
                  <input
                    type="number"
                    value={formData.currentYearSetOff.capitalLossSetOff || ''}
                    onChange={(e) => handleSetOffChange('capitalLossSetOff', parseFloat(e.target.value) || 0)}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #7C3AED, #A855F7)',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Carry Forward Losses'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
