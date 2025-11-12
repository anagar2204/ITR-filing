'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import ITRStepper from '../components/ITRStepper'
import { DollarSign, TrendingUp, Home, Briefcase, Bitcoin, FileText, Check, Plus, ArrowRight, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface IncomeCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  added: boolean
  color: string
}

export default function IncomeSourcesPage() {
  const { theme } = useTheme()
  const router = useRouter()

  const [incomeSources, setIncomeSources] = useState<IncomeCard[]>([
    {
      id: 'salary',
      title: 'Salary Income',
      description: 'Upload Form 16 or add salary details manually',
      icon: <Briefcase className="h-6 w-6" />,
      added: false,
      color: '#16A34A'
    },
    {
      id: 'interest',
      title: 'Interest Income',
      description: 'Savings account, FD, and other interest income',
      icon: <DollarSign className="h-6 w-6" />,
      added: false,
      color: '#06B6D4'
    },
    {
      id: 'capital-gains',
      title: 'Capital Gains',
      description: 'Stocks, mutual funds, and F&O trading',
      icon: <TrendingUp className="h-6 w-6" />,
      added: false,
      color: '#2563EB'
    },
    {
      id: 'house-property',
      title: 'House Property',
      description: 'Rental income from property',
      icon: <Home className="h-6 w-6" />,
      added: false,
      color: '#7C3AED'
    },
    {
      id: 'crypto',
      title: 'Crypto/VDA Income',
      description: 'Virtual Digital Assets income',
      icon: <Bitcoin className="h-6 w-6" />,
      added: false,
      color: '#F59E0B'
    },
    {
      id: 'other',
      title: 'Other Income',
      description: 'Dividend, gaming, exempt income, etc.',
      icon: <FileText className="h-6 w-6" />,
      added: false,
      color: '#EF4444'
    }
  ])

  const handleContinue = () => {
    router.push('/itr/tax-saving')
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: theme === 'dark'
        ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
        : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)'
    }}>
      <ITRStepper />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent" style={{
            backgroundImage: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)'
          }}>
            Income Sources
          </h1>
          <p className="mb-8" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
            Add all your income sources for accurate tax calculation
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {incomeSources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={source.id === 'salary' ? '/form16-upload' : '#'}
                  className="block h-full rounded-2xl backdrop-blur-md border p-6 transition-all hover:scale-105 hover:shadow-2xl group"
                  style={{
                    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: source.added
                      ? source.color
                      : theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(37, 99, 235, 0.06)',
                    boxShadow: source.added
                      ? `0 0 0 2px ${source.color}20, 0 10px 25px rgba(6, 182, 212, 0.15)`
                      : '0 10px 25px rgba(6, 182, 212, 0.08)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{
                      background: `linear-gradient(135deg, ${source.color}20, ${source.color}10)`,
                      color: source.color
                    }}>
                      {source.icon}
                    </div>
                    {source.added && (
                      <div className="p-1 rounded-full" style={{ background: source.color }}>
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{
                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                  }}>
                    {source.title}
                  </h3>
                  <p className="text-sm mb-4" style={{
                    color: theme === 'dark' ? '#94A3B8' : '#64748B'
                  }}>
                    {source.description}
                  </p>
                  <button
                    className="flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: source.color }}
                  >
                    <Plus className="h-4 w-4" />
                    {source.added ? 'Edit Details' : 'Add Details'}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:shadow-2xl hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              Continue to Tax Saving
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
