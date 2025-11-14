'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import TaxGenieLoader from './TaxGenieLoader'

interface LoadingContextType {
  isLoading: boolean
  showLoader: (message?: string) => void
  hideLoader: () => void
  setLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export default function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Tax Genie is preparing your experience…")
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null)

  // Monitor network speed
  useEffect(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection && connection.downlink) {
        setNetworkSpeed(connection.downlink)
      }
    }
  }, [])

  // Auto-show loader for slow networks
  useEffect(() => {
    if (networkSpeed !== null && networkSpeed < 1) {
      // Show loader for very slow connections (< 1 Mbps)
      showLoader("Optimizing for your connection speed…")
      setTimeout(() => {
        hideLoader()
      }, 2000)
    }
  }, [networkSpeed])

  const showLoader = (message?: string) => {
    if (message) {
      setLoadingMessage(message)
    }
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  const updateLoadingMessage = (message: string) => {
    setLoadingMessage(message)
  }

  // Intercept fetch requests to show loader for slow API calls
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = Date.now()
      
      try {
        const response = await originalFetch(...args)
        const endTime = Date.now()
        const duration = endTime - startTime

        // If API call took longer than 600ms, show a brief loader for future calls
        if (duration > 600) {
          showLoader("Processing your request…")
          setTimeout(() => {
            hideLoader()
          }, 500)
        }

        return response
      } catch (error) {
        hideLoader()
        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        showLoader,
        hideLoader,
        setLoadingMessage: updateLoadingMessage
      }}
    >
      {children}
      <TaxGenieLoader isVisible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  )
}
