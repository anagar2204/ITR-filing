'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { CheckCircle, AlertCircle, RefreshCw, Database, Upload, Download, Trash2, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface DataStatus {
  userId: string
  timestamp: string
  incomeData: any
  deductionData: any
  summary: any
}

export default function DataDebugPage() {
  const { theme } = useTheme()
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const fetchDataStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/data-validation/status?userId=default-user')
      const data = await response.json()
      
      if (data.success) {
        setDataStatus(data.data)
      }
    } catch (error) {
      console.error('Error fetching data status:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSampleData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/data-validation/sample?userId=default-user', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Sample data added successfully!')
        await fetchDataStatus()
      }
    } catch (error) {
      console.error('Error adding sample data:', error)
      alert('Failed to add sample data')
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/data-validation/clear?userId=default-user', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('All data cleared successfully!')
        await fetchDataStatus()
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Failed to clear data')
    } finally {
      setLoading(false)
    }
  }

  const testDataFlow = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/data-validation/test-flow?userId=default-user', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setTestResults(data.data)
        await fetchDataStatus()
      }
    } catch (error) {
      console.error('Error testing data flow:', error)
      alert('Failed to test data flow')
    } finally {
      setLoading(false)
    }
  }

  const testFormSubmission = async () => {
    setLoading(true)
    try {
      // Test salary form submission
      const salaryData = {
        userId: 'default-user',
        employerName: 'Frontend Test Corp',
        employerPAN: 'ABCDE1234F',
        employerTAN: 'BLRT12345A',
        grossSalary: 1500000,
        basicSalary: 1000000,
        hra: 300000,
        lta: 25000,
        specialAllowance: 100000,
        otherAllowances: 75000,
        professionalTax: 2400,
        tds: 150000,
        form16Available: true,
        exemptAllowances: {
          hraExempt: 150000,
          ltaExempt: 25000,
          otherExempt: 0
        },
        standardDeduction: 75000,
        entertainmentAllowance: 0
      }

      const salaryResponse = await fetch('http://localhost:5000/api/income-sources/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(salaryData)
      })

      const salaryResult = await salaryResponse.json()
      
      // Test Section 80C submission
      const section80CData = {
        userId: 'default-user',
        lifeInsurancePremium: 100000,
        epfContribution: 120000,
        ppfContribution: 50000,
        elssInvestment: 30000,
        nscInvestment: 0,
        sukanyaSamriddhiYojana: 0,
        homeLoanPrincipal: 0,
        tuitionFees: 0,
        maxLimit: 150000,
        additionalNPSLimit: 50000,
        section80CCD1B: 50000
      }

      const section80CResponse = await fetch('http://localhost:5000/api/tax-savings/section-80c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(section80CData)
      })

      const section80CResult = await section80CResponse.json()

      setTestResults({
        salarySubmission: salaryResult,
        section80CSubmission: section80CResult,
        allSuccessful: salaryResult.success && section80CResult.success
      })

      if (salaryResult.success && section80CResult.success) {
        alert('Form submission test successful!')
        await fetchDataStatus()
      } else {
        alert('Form submission test failed!')
      }

    } catch (error) {
      console.error('Error testing form submission:', error)
      alert('Form submission test failed with error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataStatus()
  }, [])

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
        : 'linear-gradient(135deg, #F3FAF7 0%, #ECF5FF 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{
            backgroundImage: theme === 'dark'
              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
              : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)'
          }}>
            Data Storage Debug Console
          </h1>
          <p className="text-lg" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
            Debug and validate data storage across all income and deduction sections
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
          style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
            Data Operations
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={fetchDataStatus}
              disabled={loading}
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                color: '#3B82F6'
              }}
            >
              <RefreshCw className="h-5 w-5" />
              Refresh Status
            </button>

            <button
              onClick={addSampleData}
              disabled={loading}
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                color: '#10B981'
              }}
            >
              <Upload className="h-5 w-5" />
              Add Sample Data
            </button>

            <button
              onClick={testFormSubmission}
              disabled={loading}
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                color: '#F59E0B'
              }}
            >
              <Play className="h-5 w-5" />
              Test Forms
            </button>

            <button
              onClick={clearAllData}
              disabled={loading}
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                color: '#EF4444'
              }}
            >
              <Trash2 className="h-5 w-5" />
              Clear All Data
            </button>
          </div>
        </motion.div>

        {/* Data Status */}
        {dataStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
            }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              Current Data Status
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Income Data */}
              <div>
                <h4 className="font-medium mb-3" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Income Sources
                </h4>
                <div className="space-y-2">
                  {Object.entries(dataStatus.incomeData).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }}>
                      <span className="capitalize" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        {value.hasData ? (
                          <CheckCircle className="h-4 w-4" style={{ color: '#16A34A' }} />
                        ) : (
                          <AlertCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
                        )}
                        <span className="text-sm font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                          {value.count} entries
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deduction Data */}
              <div>
                <h4 className="font-medium mb-3" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Tax Savings & Deductions
                </h4>
                <div className="space-y-2">
                  {Object.entries(dataStatus.deductionData).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }}>
                      <span className="capitalize" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        {value.hasData ? (
                          <CheckCircle className="h-4 w-4" style={{ color: '#16A34A' }} />
                        ) : (
                          <AlertCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
                        )}
                        <span className="text-sm font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                          {value.hasData ? 'Configured' : 'Not Set'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-xl" style={{
              background: dataStatus.summary.dataCompleteness >= 50 
                ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
                : (theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'),
              border: `1px solid ${dataStatus.summary.dataCompleteness >= 50 ? '#16A34A' : '#F59E0B'}`
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    Data Completeness: {dataStatus.summary.dataCompleteness}%
                  </h5>
                  <p className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    {dataStatus.summary.totalIncomeEntries} income entries, {dataStatus.summary.totalDeductionEntries} deduction sections
                  </p>
                </div>
                <Database className="h-8 w-8" style={{ 
                  color: dataStatus.summary.dataCompleteness >= 50 ? '#16A34A' : '#F59E0B' 
                }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Results */}
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl backdrop-blur-md border"
            style={{
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
            }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              Test Results
            </h3>
            <pre className="text-sm p-4 rounded-lg overflow-auto" style={{
              background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
              color: theme === 'dark' ? '#94A3B8' : '#475569'
            }}>
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  )
}
