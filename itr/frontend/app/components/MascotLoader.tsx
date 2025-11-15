'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MascotLoaderProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  showMessage?: boolean
}

export default function MascotLoader({ 
  size = 'medium', 
  message = 'Loading Tax Genie...', 
  showMessage = true 
}: MascotLoaderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const sizeClasses = {
    small: 'w-6 h-6 text-lg',
    medium: 'w-12 h-12 text-3xl',
    large: 'w-20 h-20 text-5xl'
  }

  const containerClasses = {
    small: 'gap-2',
    medium: 'gap-3',
    large: 'gap-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      {/* Animated Mascot Icon */}
      <motion.div
        className={`${sizeClasses[size]} flex items-center justify-center relative`}
        animate={!prefersReducedMotion ? {
          y: [0, -8, 0],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={!prefersReducedMotion ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        {/* Genie Emoji as fallback */}
        <span 
          role="img" 
          aria-label="Tax Genie loading"
          className="select-none"
        >
          🧞‍♂️
        </span>
        
        {/* Glow effect */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-30 blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Loading Message */}
      {showMessage && (
        <motion.p
          className={`text-gray-600 font-medium ${
            size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          aria-live="polite"
        >
          {message}
        </motion.p>
      )}

      {/* Loading dots */}
      {!prefersReducedMotion && (
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full ${
                size === 'small' ? 'w-1 h-1' : size === 'large' ? 'w-2 h-2' : 'w-1.5 h-1.5'
              }`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
