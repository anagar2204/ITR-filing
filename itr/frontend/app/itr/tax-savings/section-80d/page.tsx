'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Upload, 
  ArrowLeft,
  Save,
  Calculator,
  Users,
  UserCheck,
  Stethoscope,
  Shield
} from 'lucide-react'
import axios from 'axios'

interface Section80DData {
  selfFamilyPremium: number
  selfFamilyPreventiveCheckup: number
  selfFamilyMedicalExpenses: number
  parentsPremium: number
  parentsPreventiveCheckup: number
  parentsMedicalExpenses: number
  selfAge: 'below60' | 'above60'
  spouseAge: 'below60' | 'above60'
  parentsAge: 'below60' | 'above60'
  cghsContribution: number
}

export default function Section80DPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<Section80DData>({
    selfFamilyPremium: 0,
    selfFamilyPreventiveCheckup: 0,
    selfFamilyMedicalExpenses: 0,
    parentsPremium: 0,
    parentsPreventiveCheckup: 0,
    parentsMedicalExpenses: 0,
    selfAge: 'below60',
    spouseAge: 'below60',
    parentsAge: 'below60',
    cghsContribution: 0
  })

  useEffect(() => {
    // Load existing data when component mounts
    const loadExistingData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tax-savings/section-80d?userId=default-user')
        if (response.data.success && response.data.data) {
          setFormData(response.data.data)
        }
      } catch (error) {
        console.log('No existing data found or error loading data:', error)
      }
    }
    
    loadExistingData()
  }, [])

  const handleInputChange = (field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/tax-savings/section-80d', {
        ...formData,
        userId: 'default-user',
        documents: []
      })

      if (response.data.success) {
        alert('Section 80D data saved successfully!')
        router.push('/itr/tax-savings')
      }
    } catch (error) {
      console.error('Error saving Section 80D data:', error)
      alert('Failed to save Section 80D data')
    } finally {
      setLoading(false)
    }
  }

  const getSelfFamilyLimit = () => {
    return (formData.selfAge === 'above60' || formData.spouseAge === 'above60') ? 50000 : 25000
  }

  const getParentsLimit = () => {
    return formData.parentsAge === 'above60' ? 50000 : 25000
  }

  const calculateSelfFamilyDeduction = () => {
    const total = formData.selfFamilyPremium + formData.selfFamilyPreventiveCheckup + formData.selfFamilyMedicalExpenses
    return Math.min(total, getSelfFamilyLimit())
  }

  const calculateParentsDeduction = () => {
    const total = formData.parentsPremium + formData.parentsPreventiveCheckup + formData.parentsMedicalExpenses
    return Math.min(total, getParentsLimit())
  }

  const calculateTotalDeduction = () => {
    return calculateSelfFamilyDeduction() + calculateParentsDeduction() + formData.cghsContribution
  }

  const sections = [
    {
      title: 'Self & Family',
      color: '#DC2626',
      icon: Users,
      fields: [
        { key: 'selfFamilyPremium', label: 'Health Insurance Premium', type: 'number' },
        { key: 'selfFamilyPreventiveCheckup', label: 'Preventive Health Checkup', type: 'number', max: 5000 },
        { key: 'selfFamilyMedicalExpenses', label: 'Medical Expenses (Senior Citizens)', type: 'number' }
      ],
      ageFields: [
        { key: 'selfAge', label: 'Your Age' },
        { key: 'spouseAge', label: 'Spouse Age' }
      ]
    },
    {
      title: 'Parents',
      color: '#7C3AED',
      icon: UserCheck,
      fields: [
        { key: 'parentsPremium', label: 'Parents Health Insurance Premium', type: 'number' },
        { key: 'parentsPreventiveCheckup', label: 'Parents Preventive Health Checkup', type: 'number', max: 5000 },
        { key: 'parentsMedicalExpenses', label: 'Parents Medical Expenses (Senior Citizens)', type: 'number' }
      ],
      ageFields: [
        { key: 'parentsAge', label: 'Parents Age' }
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
                <div className="p-3 rounded-xl" style={{ background: '#DC262620', color: '#DC2626' }}>
                  <Heart className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #DC2626, #EF4444)'
                }}>
                  Section 80D - Health Insurance
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Save up to ₹1 lakh in taxes with health insurance premiums
              </p>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section, sectionIndex) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.title}
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
                  <Icon className="h-5 w-5" style={{ color: section.color }} />
                  {section.title}
                </h3>

                {/* Age Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3" style={{
                    color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                  }}>
                    Age Category (affects deduction limit)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.ageFields.map((ageField) => (
                      <div key={ageField.key}>
                        <label className="block">
                          <span className="text-sm font-medium mb-2 block" style={{
                            color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                          }}>
                            {ageField.label}
                          </span>
                          <select
                            value={formData[ageField.key as keyof Section80DData] as string}
                            onChange={(e) => handleInputChange(ageField.key, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl"
                            style={{
                              background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                            }}
                          >
                            <option value="below60">Below 60 years</option>
                            <option value="above60">60 years and above</option>
                          </select>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  {section.fields.map((field) => {
                    const value = formData[field.key as keyof Section80DData] as number
                    
                    return (
                      <div key={field.key}>
                        <label className="block">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="h-4 w-4" style={{ color: section.color }} />
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
                                className="hidden"
                              />
                            </label>
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>

                {/* Section Summary */}
                <div className="mt-6 p-4 rounded-xl" style={{
                  background: theme === 'dark' 
                    ? `linear-gradient(135deg, ${section.color}10, ${section.color}05)`
                    : `linear-gradient(135deg, ${section.color}08, ${section.color}04)`,
                  border: `1px solid ${section.color}30`
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      {section.title} Deduction
                    </span>
                    <span className="text-lg font-semibold" style={{ color: section.color }}>
                      ₹{(section.title === 'Self & Family' ? calculateSelfFamilyDeduction() : calculateParentsDeduction()).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Limit: ₹{(section.title === 'Self & Family' ? getSelfFamilyLimit() : getParentsLimit()).toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {/* CGHS Section */}
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
              <Shield className="h-5 w-5" style={{ color: '#059669' }} />
              CGHS/Government Scheme
            </h3>
            <div className="max-w-md">
              <label className="block">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" style={{ color: '#059669' }} />
                  <span className="text-sm font-medium" style={{
                    color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                  }}>
                    CGHS Contribution
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Contribution to Central Government Health Scheme
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{
                    color: theme === 'dark' ? '#94A3B8' : '#475569'
                  }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.cghsContribution || ''}
                    onChange={(e) => handleInputChange('cghsContribution', parseFloat(e.target.value) || 0)}
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
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.1))'
                : 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(239, 68, 68, 0.08))',
              borderColor: theme === 'dark' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
            }}>
              <Calculator className="h-5 w-5" style={{ color: '#DC2626' }} />
              Section 80D Summary
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Self & Family
                </p>
                <p className="text-xl font-semibold" style={{ color: '#DC2626' }}>
                  ₹{calculateSelfFamilyDeduction().toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Max: ₹{getSelfFamilyLimit().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Parents
                </p>
                <p className="text-xl font-semibold" style={{ color: '#7C3AED' }}>
                  ₹{calculateParentsDeduction().toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Max: ₹{getParentsLimit().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  CGHS
                </p>
                <p className="text-xl font-semibold" style={{ color: '#059669' }}>
                  ₹{formData.cghsContribution.toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  No limit
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Total Deduction
                </p>
                <p className="text-xl font-semibold" style={{ color: '#EF4444' }}>
                  ₹{calculateTotalDeduction().toLocaleString('en-IN')}
                </p>
                <p className="text-xs" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                  Tax saving: ₹{(calculateTotalDeduction() * 0.3).toLocaleString('en-IN')}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #DC2626, #EF4444)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Section 80D'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
