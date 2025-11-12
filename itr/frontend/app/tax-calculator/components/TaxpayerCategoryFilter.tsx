'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Building2 } from 'lucide-react'

interface TaxpayerOption {
  id: 'individual' | 'huf' | 'firm' | 'llp' | 'domestic-company' | 'foreign-company'
  title: string
  desc: string
}

interface TaxpayerCategoryFilterProps {
  value: 'individual' | 'huf' | 'firm' | 'llp' | 'domestic-company' | 'foreign-company'
  onChange: (value: 'individual' | 'huf' | 'firm' | 'llp' | 'domestic-company' | 'foreign-company') => void
  theme?: 'light' | 'dark'
}

export default function TaxpayerCategoryFilter({ value, onChange, theme = 'light' }: TaxpayerCategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const options: TaxpayerOption[] = [
    { id: 'individual', title: 'Individual', desc: 'Salaried or self-employed person' },
    { id: 'huf', title: 'HUF', desc: 'Hindu Undivided Family' },
    { id: 'firm', title: 'Firm', desc: 'Partnership firm' },
    { id: 'llp', title: 'LLP', desc: 'Limited Liability Partnership' },
    { id: 'domestic-company', title: 'Domestic Company', desc: 'Indian registered company' },
    { id: 'foreign-company', title: 'Foreign Company', desc: 'Non-resident company' },
  ]

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', onDoc)
      return () => document.removeEventListener('mousedown', onDoc)
    }
  }, [open])

  // Reset active index when closed
  useEffect(() => {
    if (!open) setActiveIndex(-1)
  }, [open])

  // Handle option selection
  const handleSelect = (optionId: 'individual' | 'huf' | 'firm' | 'llp' | 'domestic-company' | 'foreign-company') => {
    onChange(optionId)
    setOpen(false)
    buttonRef.current?.focus()
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('taxpayer_category_selected', {
        value: optionId,
        page: 'tax-calculator',
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(0)
      } else {
        setActiveIndex((i) => Math.min(options.length - 1, i + 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(options.length - 1)
      } else {
        setActiveIndex((i) => Math.max(0, i - 1))
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(0)
      } else if (activeIndex >= 0) {
        handleSelect(options[activeIndex].id)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  const selectedOption = options.find((o) => o.id === value)

  return (
    <div className="relative inline-block text-left w-full" ref={ref}>
      {/* Main Control Button */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select taxpayer category"
        className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-lg backdrop-blur-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
        style={{
          background: theme === 'dark' 
            ? 'rgba(30, 41, 59, 0.5)' 
            : 'rgba(255, 255, 255, 0.85)',
          borderColor: theme === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(37, 99, 235, 0.06)',
          boxShadow: theme === 'dark'
            ? '0 4px 12px rgba(0, 0, 0, 0.2)'
            : '0 8px 20px rgba(6, 182, 212, 0.05)',
        }}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col text-left flex-1">
          <span 
            className="text-sm font-medium"
            style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
          >
            {selectedOption?.title ?? 'Select taxpayer category'}
          </span>
          <span 
            className="text-xs"
            style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
          >
            {selectedOption?.desc ?? 'Choose your taxpayer type'}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
        />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 mt-2 z-50 overflow-hidden rounded-lg backdrop-blur-md border max-h-80 overflow-y-auto"
            style={{
              background: theme === 'dark'
                ? 'rgba(30, 41, 59, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderColor: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(37, 99, 235, 0.06)',
              boxShadow: theme === 'dark'
                ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                : '0 12px 32px rgba(6, 182, 212, 0.12)',
            }}
          >
            <ul
              role="listbox"
              aria-activedescendant={activeIndex >= 0 ? `taxpayer-option-${activeIndex}` : undefined}
              tabIndex={-1}
              className="py-1"
            >
              {options.map((opt, idx) => {
                const selected = opt.id === value
                const active = idx === activeIndex

                return (
                  <li
                    id={`taxpayer-option-${idx}`}
                    key={opt.id}
                    role="option"
                    aria-selected={selected}
                    className="px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors duration-150"
                    style={{
                      background: selected
                        ? theme === 'dark'
                          ? 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                          : 'linear-gradient(to right, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))'
                        : active
                        ? theme === 'dark'
                          ? 'rgba(6, 182, 212, 0.08)'
                          : 'rgba(6, 182, 212, 0.03)'
                        : 'transparent',
                      outline: active ? '2px solid' : 'none',
                      outlineColor: theme === 'dark' ? '#06B6D4' : '#06B6D4',
                      outlineOffset: '-2px',
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(opt.id)}
                  >
                    {/* Check icon for selected state */}
                    <div className="flex-shrink-0 mt-0.5">
                      {selected ? (
                        <Check
                          className="h-4 w-4"
                          style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}
                        />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>

                    {/* Option text */}
                    <div className="flex flex-col flex-1">
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: selected
                            ? theme === 'dark' ? '#10B981' : '#16A34A'
                            : theme === 'dark' ? '#FFFFFF' : '#0F172A',
                        }}
                      >
                        {opt.title}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                      >
                        {opt.desc}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {selectedOption && `Selected taxpayer category: ${selectedOption.title}`}
      </div>
    </div>
  )
}
