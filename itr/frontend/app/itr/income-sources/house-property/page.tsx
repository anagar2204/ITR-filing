'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'
import { 
  Home, 
  DollarSign,
  ArrowLeft,
  Save,
  Calculator,
  Plus,
  Trash2,
  Building,
  Users
} from 'lucide-react'
import axios from 'axios'

interface Property {
  propertyId: string
  address: string
  propertyType: 'self_occupied' | 'let_out' | 'deemed_let_out'
  annualValue: number
  rentReceived: number
  municipalTax: number
  standardDeduction: number
  interestOnLoan: number
  principalRepayment: number
  coOwners?: Array<{
    name: string
    pan: string
    sharePercentage: number
  }>
}

interface HousePropertyData {
  properties: Property[]
}

export default function HousePropertyPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<HousePropertyData>({
    properties: [{
      propertyId: '1',
      address: '',
      propertyType: 'self_occupied',
      annualValue: 0,
      rentReceived: 0,
      municipalTax: 0,
      standardDeduction: 0,
      interestOnLoan: 0,
      principalRepayment: 0,
      coOwners: []
    }]
  })

  const handlePropertyChange = (index: number, field: string, value: string | number) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: value
    }
    
    // Auto-calculate standard deduction (30% of annual value or rent received)
    if (field === 'annualValue' || field === 'rentReceived') {
      const property = updatedProperties[index]
      const baseAmount = Math.max(property.annualValue, property.rentReceived)
      updatedProperties[index].standardDeduction = baseAmount * 0.3
    }
    
    setFormData(prev => ({
      ...prev,
      properties: updatedProperties
    }))
  }

  const addProperty = () => {
    const newProperty: Property = {
      propertyId: (formData.properties.length + 1).toString(),
      address: '',
      propertyType: 'self_occupied',
      annualValue: 0,
      rentReceived: 0,
      municipalTax: 0,
      standardDeduction: 0,
      interestOnLoan: 0,
      principalRepayment: 0,
      coOwners: []
    }
    
    setFormData(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty]
    }))
  }

  const removeProperty = (index: number) => {
    if (formData.properties.length > 1) {
      setFormData(prev => ({
        ...prev,
        properties: prev.properties.filter((_, i) => i !== index)
      }))
    }
  }

  const addCoOwner = (propertyIndex: number) => {
    const updatedProperties = [...formData.properties]
    if (!updatedProperties[propertyIndex].coOwners) {
      updatedProperties[propertyIndex].coOwners = []
    }
    updatedProperties[propertyIndex].coOwners!.push({
      name: '',
      pan: '',
      sharePercentage: 0
    })
    
    setFormData(prev => ({
      ...prev,
      properties: updatedProperties
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/income-sources/house-property', {
        ...formData,
        userId: 'default-user'
      })

      if (response.data.success) {
        alert('House property saved successfully!')
        router.push('/itr/income-sources')
      }
    } catch (error) {
      console.error('Error saving house property:', error)
      alert('Failed to save house property')
    } finally {
      setLoading(false)
    }
  }

  const calculateNetIncome = (property: Property) => {
    if (property.propertyType === 'self_occupied') return 0
    
    const grossIncome = Math.max(property.annualValue, property.rentReceived)
    const deductions = property.municipalTax + property.standardDeduction + property.interestOnLoan
    return Math.max(0, grossIncome - deductions)
  }

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
                  <Home className="h-8 w-8" />
                </div>
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(90deg, #7C3AED, #EC4899)'
                }}>
                  House Property
                </span>
              </h1>
              <p style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Add rental income from your properties
              </p>
            </div>
          </div>

          {/* Properties */}
          <div className="space-y-8">
            {formData.properties.map((property, index) => (
              <motion.div
                key={property.propertyId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-md border"
                style={{
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{
                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                  }}>
                    <Building className="h-5 w-5" style={{ color: '#7C3AED' }} />
                    Property {index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {formData.properties.length > 1 && (
                      <button
                        onClick={() => removeProperty(index)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="text-sm font-medium mb-2 block" style={{
                        color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                      }}>
                        Property Address
                      </span>
                      <input
                        type="text"
                        value={property.address}
                        onChange={(e) => handlePropertyChange(index, 'address', e.target.value)}
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
                        Property Type
                      </span>
                      <select
                        value={property.propertyType}
                        onChange={(e) => handlePropertyChange(index, 'propertyType', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl"
                        style={{
                          background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                          color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                        }}
                      >
                        <option value="self_occupied">Self Occupied</option>
                        <option value="let_out">Let Out</option>
                        <option value="deemed_let_out">Deemed Let Out</option>
                      </select>
                    </label>
                  </div>

                  {property.propertyType !== 'self_occupied' && (
                    <>
                      <div>
                        <label className="block">
                          <span className="text-sm font-medium mb-2 block" style={{
                            color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                          }}>
                            Annual Rental Value (₹)
                          </span>
                          <input
                            type="number"
                            value={property.annualValue || ''}
                            onChange={(e) => handlePropertyChange(index, 'annualValue', parseFloat(e.target.value) || 0)}
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
                            Rent Received (₹)
                          </span>
                          <input
                            type="number"
                            value={property.rentReceived || ''}
                            onChange={(e) => handlePropertyChange(index, 'rentReceived', parseFloat(e.target.value) || 0)}
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
                            Municipal Tax (₹)
                          </span>
                          <input
                            type="number"
                            value={property.municipalTax || ''}
                            onChange={(e) => handlePropertyChange(index, 'municipalTax', parseFloat(e.target.value) || 0)}
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
                            Standard Deduction (₹)
                          </span>
                          <input
                            type="number"
                            value={property.standardDeduction || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-xl"
                            style={{
                              background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                              color: theme === 'dark' ? '#94A3B8' : '#64748B'
                            }}
                          />
                        </label>
                        <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                          Auto-calculated as 30% of annual value/rent
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block">
                      <span className="text-sm font-medium mb-2 block" style={{
                        color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                      }}>
                        Interest on Home Loan (₹)
                      </span>
                      <input
                        type="number"
                        value={property.interestOnLoan || ''}
                        onChange={(e) => handlePropertyChange(index, 'interestOnLoan', parseFloat(e.target.value) || 0)}
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
                        Principal Repayment (₹)
                      </span>
                      <input
                        type="number"
                        value={property.principalRepayment || ''}
                        onChange={(e) => handlePropertyChange(index, 'principalRepayment', parseFloat(e.target.value) || 0)}
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

                {/* Net Income Summary */}
                <div className="mt-6 p-4 rounded-xl" style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))'
                    : 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.08))',
                  border: `1px solid ${theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.15)'}`
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{
                      color: theme === 'dark' ? '#D1D5DB' : '#0F172A'
                    }}>
                      Net Income from this Property
                    </span>
                    <span className="text-lg font-semibold" style={{
                      color: calculateNetIncome(property) >= 0 ? '#16A34A' : '#EF4444'
                    }}>
                      ₹{calculateNetIncome(property).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Property Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <button
              onClick={addProperty}
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-105 mx-auto"
              style={{
                background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
                color: 'white'
              }}
            >
              <Plus className="h-5 w-5" />
              Add Another Property
            </button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                background: loading ? '#94A3B8' : 'linear-gradient(90deg, #7C3AED, #EC4899)',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save House Property'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
