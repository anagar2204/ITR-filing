'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What is Form-16?',
    answer: 'Form-16 is a certificate issued by your employer showing the salary paid and tax deducted (TDS) during a financial year. It\'s required for filing your income tax return.'
  },
  {
    question: 'Where do I get my Form-16?',
    answer: 'Your employer or HR department provides Form-16, usually by June 15th after the financial year ends. Check your company portal or email your HR team.'
  },
  {
    question: 'Can I upload multiple Form-16s?',
    answer: 'Yes! If you switched jobs during the financial year, upload all Form-16s from different employers. Our system will automatically merge the data.'
  },
  {
    question: 'My annexure is in a separate file',
    answer: 'No problem. Upload both the main Form-16 and the annexure PDF. Our parser will detect and merge the annexure data automatically.'
  },
  {
    question: 'What if my Form-16 is a scanned photo?',
    answer: 'We support scanned images using OCR technology. For best results, ensure the photo is clear, well-lit, and all text is readable. Accuracy may be slightly lower than digital PDFs.'
  },
  {
    question: 'How is my data stored?',
    answer: 'Your Form-16 is encrypted and stored securely. Files are automatically deleted after 7 days or when you confirm the data application. We never share your data with third parties.'
  }
]

interface FAQPanelProps {
  theme: 'light' | 'dark'
}

export default function FAQPanel({ theme }: FAQPanelProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div
      className="rounded-2xl backdrop-blur-md border p-6 sticky top-8"
      style={{
        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)',
        boxShadow: '0 12px 30px rgba(6, 182, 212, 0.06)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-5 w-5" style={{ color: '#16A34A' }} />
        <h2 
          className="text-xl font-semibold"
          style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
        >
          Frequently Asked Questions
        </h2>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg border overflow-hidden"
            style={{
              background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(255, 255, 255, 0.6)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(148, 163, 184, 0.2)'
            }}
          >
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors duration-200 hover:bg-black/5"
            >
              <span 
                className="font-medium text-sm"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              >
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown 
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}
                />
              </motion.div>
            </button>

            {/* Answer */}
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div 
                    className="px-4 pb-3 text-sm"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                  >
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Help CTA */}
      <div 
        className="mt-6 p-4 rounded-lg text-center"
        style={{
          background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(22, 163, 74, 0.05)',
          border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 163, 74, 0.1)'}`
        }}
      >
        <MessageCircle 
          className="h-6 w-6 mx-auto mb-2"
          style={{ color: '#16A34A' }}
        />
        <h3 
          className="font-medium text-sm mb-1"
          style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
        >
          Still need help?
        </h3>
        <p 
          className="text-xs mb-3"
          style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
        >
          Our support team is here to assist you
        </p>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: '#16A34A',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
          }}
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}
