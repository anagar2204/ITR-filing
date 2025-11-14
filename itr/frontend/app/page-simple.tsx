'use client'

import React from 'react'
import { ArrowRight, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function TaxGenieLanding() {
  const router = useRouter()

  const handleEnterTaxGenie = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="text-center max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
        >
          Tax Genie
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl font-semibold text-gray-800 mb-4"
        >
          Filing taxes made effortless with your personal AI Genie.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-gray-600 mb-8"
        >
          Automate, calculate, and file — faster, smarter, and stress-free.
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={handleEnterTaxGenie}
          className="px-8 py-4 rounded-2xl font-semibold text-lg text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:scale-105 transition-transform shadow-lg"
        >
          <span className="flex items-center gap-3">
            <Wand2 className="h-6 w-6" />
            Enter Tax Genie
            <ArrowRight className="h-5 w-5" />
          </span>
        </motion.button>
      </div>
    </div>
  )
}
