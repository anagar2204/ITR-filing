'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface TaxGenieLoaderProps {
  isVisible: boolean
  message?: string
}

export default function TaxGenieLoader({ 
  isVisible, 
  message = "Tax Genie is preparing your experience…" 
}: TaxGenieLoaderProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(240, 253, 244, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="text-center">
        {/* Mascot Container */}
        <motion.div
          className="relative mb-8"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, #10B981, transparent 70%)',
              filter: 'blur(30px)',
              transform: 'scale(1.5)'
            }}
            animate={{
              scale: [1.5, 1.8, 1.5],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Mascot Image */}
          <motion.div
            className="relative z-10"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
          >
            <Image
              src="/tax-genie-mascot.png"
              alt="Tax Genie Loading"
              width={120}
              height={120}
              className="mx-auto drop-shadow-lg"
              priority
            />

            {/* Floating Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-medium text-gray-700 mb-4"
        >
          {message}
        </motion.p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #059669, #0891B2)'
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
