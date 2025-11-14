'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { CheckCircle, AlertCircle, Play, Download, Target, TrendingUp, Award, Users, Calculator } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TestResult {
  user: any
  accuracy: number
  passed: boolean
  details: any
}

interface TestSummary {
  overallAccuracy: number
  totalTests: number
  passedTests: number
  failedTests: number
  results: TestResult[]
  readyForEnhancement: boolean
}

export default function TestAccuracyPage() {
  const { theme } = useTheme()
  const [testResults, setTestResults] = useState<TestSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null)

  const runAccuracyTests = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/test-users/realistic/run-all', {
        method: 'POST'
      })
      
      const data = await response.json()
      if (data.success) {
        setTestResults(data.data)
      }
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return '#16A34A'
    if (accuracy >= 80) return '#F59E0B'
    return '#EF4444'
  }

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy >= 95) return 'Excellent'
    if (accuracy >= 90) return 'Very Good'
    if (accuracy >= 80) return 'Good'
    if (accuracy >= 70) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
        : 'linear-gradient(135deg, #F3FAF7 0%, #ECF5FF 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
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
            Tax Calculation Accuracy Testing
          </h1>
          <p className="text-lg" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
            Comprehensive testing suite to validate mathematical accuracy and ensure reliable tax calculations
          </p>
        </motion.div>

        {/* Test Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl backdrop-blur-md border text-center"
          style={{
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          }}
        >
          <h2 className="text-2xl font-semibold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
            Run Comprehensive Accuracy Tests
          </h2>
          <p className="mb-6" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
            Test multiple user scenarios with different income levels, deductions, and tax situations
          </p>
          
          <button
            onClick={runAccuracyTests}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            style={{
              background: loading ? '#6B7280' : 'linear-gradient(90deg, #16A34A, #06B6D4)',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(22, 163, 74, 0.3)'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Run Accuracy Tests
              </>
            )}
          </button>
        </motion.div>

        {/* Test Results */}
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Overall Results */}
            <div className="p-6 rounded-2xl backdrop-blur-md border" style={{
              background: testResults.overallAccuracy >= 90 
                ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                : testResults.overallAccuracy >= 80
                  ? (theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)')
                  : (theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
              borderColor: getAccuracyColor(testResults.overallAccuracy)
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  Overall Test Results
                </h3>
                <div className="flex items-center gap-2">
                  {testResults.overallAccuracy >= 90 ? (
                    <CheckCircle className="h-6 w-6" style={{ color: '#16A34A' }} />
                  ) : (
                    <AlertCircle className="h-6 w-6" style={{ color: '#F59E0B' }} />
                  )}
                  <span className="text-lg font-semibold" style={{ color: getAccuracyColor(testResults.overallAccuracy) }}>
                    {getAccuracyLabel(testResults.overallAccuracy)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl" style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: getAccuracyColor(testResults.overallAccuracy) }}>
                    {testResults.overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Overall Accuracy
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-xl" style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: '#16A34A' }}>
                    {testResults.passedTests}
                  </div>
                  <div className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Tests Passed
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-xl" style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: '#EF4444' }}>
                    {testResults.failedTests}
                  </div>
                  <div className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Tests Failed
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-xl" style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: '#06B6D4' }}>
                    {testResults.totalTests}
                  </div>
                  <div className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                    Total Tests
                  </div>
                </div>
              </div>

              {testResults.readyForEnhancement && (
                <div className="p-4 rounded-xl text-center" style={{
                  background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                  color: '#FFFFFF'
                }}>
                  <Award className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Ready for Production Enhancement!</p>
                  <p className="text-sm opacity-90">Accuracy threshold met - system is ready for advanced features</p>
                </div>
              )}
            </div>

            {/* Individual Test Results */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testResults.results.map((result, index) => (
                <motion.div
                  key={result.user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-2xl backdrop-blur-md border cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: result.passed ? '#16A34A' : '#F59E0B'
                  }}
                  onClick={() => setSelectedTest(result)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                      {result.user.name}
                    </h4>
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5" style={{ color: '#16A34A' }} />
                    ) : (
                      <AlertCircle className="h-5 w-5" style={{ color: '#F59E0B' }} />
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Profession</span>
                      <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>{result.user.profession}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Age</span>
                      <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>{result.user.age}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: getAccuracyColor(result.accuracy) }}>
                      {result.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                      Accuracy Score
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Test Details Modal */}
        <AnimatePresence>
          {selectedTest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTest(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full p-6 rounded-2xl backdrop-blur-md border max-h-[80vh] overflow-y-auto"
                style={{
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                  {selectedTest.user.name} - Detailed Results
                </h3>
                
                {selectedTest.details && selectedTest.details.validations && (
                  <div className="space-y-4">
                    {selectedTest.details.validations.map((validation: any, index: number) => (
                      <div key={index} className="p-4 rounded-xl" style={{
                        background: validation.passed 
                          ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
                          : (theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'),
                        border: `1px solid ${validation.passed ? '#16A34A' : '#F59E0B'}`
                      }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                            {validation.test}
                          </span>
                          <span className="font-bold" style={{ color: validation.passed ? '#16A34A' : '#F59E0B' }}>
                            {validation.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Expected: </span>
                            <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                              ₹{validation.expected.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>Actual: </span>
                            <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                              ₹{validation.actual.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedTest.details && selectedTest.details.recommendations && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {selectedTest.details.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
