'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

interface Step {
  id: number
  name: string
  href: string
}

const steps: Step[] = [
  { id: 1, name: 'Personal Info', href: '/itr/personal-info' },
  { id: 2, name: 'Income Sources', href: '/itr/income-sources' },
  { id: 3, name: 'Tax Saving', href: '/itr/tax-savings' },
  { id: 4, name: 'Tax Summary', href: '/itr/tax-summary' },
]

export default function ITRStepper() {
  const pathname = usePathname()
  const { theme } = useTheme()

  const getCurrentStep = () => {
    const currentStep = steps.find(step => pathname === step.href)
    return currentStep?.id || 1
  }

  const currentStepId = getCurrentStep()

  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300" style={{
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)'
    }}>
      <div className="container mx-auto px-4 py-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, stepIdx) => {
              const isCompleted = step.id < currentStepId
              const isCurrent = step.id === currentStepId
              const isUpcoming = step.id > currentStepId

              return (
                <li key={step.name} className="relative flex-1">
                  {/* Connector Line */}
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className="absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-all duration-500"
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(90deg, #16A34A, #06B6D4)'
                          : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(148, 163, 184, 0.2)'
                      }}
                    />
                  )}

                  <Link
                    href={step.href}
                    className={`group flex flex-col items-center transition-all duration-300 ${
                      isUpcoming ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {/* Step Circle */}
                    <div
                      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
                      style={{
                        background: isCompleted || isCurrent
                          ? 'linear-gradient(135deg, #16A34A, #06B6D4, #2563EB)'
                          : theme === 'dark'
                          ? 'rgba(71, 85, 105, 0.3)'
                          : 'rgba(255, 255, 255, 0.9)',
                        border: isCurrent
                          ? `2px solid ${theme === 'dark' ? '#06B6D4' : '#2563EB'}`
                          : isCompleted
                          ? 'none'
                          : `2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(148, 163, 184, 0.3)'}`,
                        boxShadow: isCurrent
                          ? '0 0 0 4px rgba(6, 182, 212, 0.15), 0 4px 12px rgba(6, 182, 212, 0.25)'
                          : isCompleted
                          ? '0 2px 8px rgba(22, 163, 74, 0.2)'
                          : 'none'
                      }}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: isCurrent
                              ? '#FFFFFF'
                              : theme === 'dark'
                              ? '#94A3B8'
                              : '#64748B'
                          }}
                        >
                          {step.id}
                        </span>
                      )}

                      {/* Pulse Animation for Current Step */}
                      {isCurrent && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{
                            background: 'linear-gradient(135deg, #16A34A, #06B6D4)',
                            opacity: 0.3
                          }}
                        />
                      )}
                    </div>

                    {/* Step Name */}
                    <span
                      className="mt-2 text-xs sm:text-sm font-medium text-center transition-colors duration-300"
                      style={{
                        color: isCurrent
                          ? theme === 'dark'
                            ? '#06B6D4'
                            : '#2563EB'
                          : isCompleted
                          ? theme === 'dark'
                            ? '#10B981'
                            : '#16A34A'
                          : theme === 'dark'
                          ? '#64748B'
                          : '#94A3B8'
                      }}
                    >
                      {step.name}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}
