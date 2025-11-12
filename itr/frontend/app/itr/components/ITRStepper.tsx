'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { motion } from 'framer-motion'

interface Step {
  id: number
  name: string
  href: string
  icon?: string
}

const steps: Step[] = [
  { id: 1, name: 'Personal Info', href: '/itr/personal-info', icon: '👤' },
  { id: 2, name: 'Income Sources', href: '/itr/income-sources', icon: '💰' },
  { id: 3, name: 'Tax Saving', href: '/itr/tax-saving', icon: '🛡️' },
  { id: 4, name: 'Tax Summary', href: '/itr/tax-summary', icon: '📊' },
]

export default function ITRStepperRedesigned() {
  const pathname = usePathname()
  const { theme } = useTheme()

  const getCurrentStep = () => {
    const currentStep = steps.find(step => pathname === step.href)
    return currentStep?.id || 1
  }

  const currentStepId = getCurrentStep()

  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300" style={{
      background: theme === 'dark' 
        ? 'rgba(15, 23, 42, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)'}`
    }}>
      <div className="container mx-auto px-4 py-4">
        <nav aria-label="Progress" className="max-w-4xl mx-auto">
          <ol className="flex items-center justify-between gap-2">
            {steps.map((step, stepIdx) => {
              const isCompleted = step.id < currentStepId
              const isCurrent = step.id === currentStepId
              const isUpcoming = step.id > currentStepId

              return (
                <li key={step.name} className="relative flex-1">
                  {/* Connector Line */}
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isCompleted ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: stepIdx * 0.1 }}
                        className="h-full origin-left"
                        style={{
                          background: 'linear-gradient(90deg, #16A34A, #06B6D4)'
                        }}
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(148, 163, 184, 0.2)'
                        }}
                      />
                    </div>
                  )}

                  <Link
                    href={isUpcoming ? '#' : step.href}
                    className={`group flex flex-col items-center transition-all duration-300 ${
                      isUpcoming ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:opacity-100'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-disabled={isUpcoming}
                    tabIndex={isUpcoming ? -1 : 0}
                  >
                    {/* Step Pill */}
                    <motion.div
                      whileHover={!isUpcoming ? { scale: 1.05 } : {}}
                      whileTap={!isUpcoming ? { scale: 0.98 } : {}}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
                      style={{
                        background: isCompleted || isCurrent
                          ? 'linear-gradient(135deg, #16A34A, #06B6D4, #2563EB)'
                          : theme === 'dark'
                          ? 'rgba(71, 85, 105, 0.3)'
                          : 'rgba(241, 245, 249, 0.9)',
                        boxShadow: isCurrent
                          ? '0 0 0 4px rgba(6, 182, 212, 0.15)'
                          : 'none'
                      }}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      ) : (
                        <span className="text-base">{step.icon}</span>
                      )}

                      {/* Glow Animation for Current Step */}
                      {isCurrent && (
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(6, 182, 212, 0.4)',
                              '0 0 0 8px rgba(6, 182, 212, 0)',
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Step Name */}
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: stepIdx * 0.1 }}
                      className="mt-2 text-xs sm:text-sm font-medium text-center transition-colors duration-300"
                      style={{
                        color: isCurrent
                          ? '#06B6D4'
                          : isCompleted
                          ? '#16A34A'
                          : theme === 'dark'
                          ? '#64748B'
                          : '#94A3B8',
                        fontWeight: isCurrent ? 600 : 500
                      }}
                    >
                      {step.name}
                    </motion.span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Auto-save Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: theme === 'dark' 
              ? 'rgba(16, 185, 129, 0.15)' 
              : 'rgba(16, 185, 129, 0.1)',
            color: '#16A34A',
            border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-green-500"
          />
          <span className="font-medium">Auto-saved</span>
        </motion.div>
      </div>
    </div>
  )
}
