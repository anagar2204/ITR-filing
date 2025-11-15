'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight } from 'lucide-react'
import MascotLoader from '../components/MascotLoader'
import './landing.css'

interface MascotConfig {
  ASSETS: {
    SERVE_PATH: string
    HEADER_BADGE: { width: number; height: number }
  }
  ANIMATIONS: {
    ENTRANCE: {
      total: number
      fadeIn: number
      spin: number
      settle: number
    }
    IDLE: {
      breathing: { duration: number; scale: { min: number; max: number } }
      rotation: { duration: number; angle: { min: number; max: number } }
      glow: { interval: number; duration: number }
    }
    HOVER: {
      wave: { rotation: { start: number; end: number }; duration: number }
      glow: { intensity: number; duration: number }
    }
  }
  RESPONSIVE: {
    desktop: { maxWidth: number }
    tablet: { maxWidth: number }
    mobile: { maxWidth: number }
    small: { maxWidth: number }
  }
  PERFORMANCE: {
    reduceMotion: boolean
    fallbackIcon: string
  }
}

export default function TaxGenieLanding() {
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<MascotConfig | null>(null)
  const [animationTriggered, setAnimationTriggered] = useState(false)
  const [mascotLoaded, setMascotLoaded] = useState(false)
  const [mascotError, setMascotError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  const router = useRouter()
  const mascotRef = useRef<HTMLImageElement>(null)
  const hasTriggeredRef = useRef(false)

  // Load mascot configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/mascot-config')
        const mascotConfig = await response.json()
        setConfig(mascotConfig)
      } catch (error) {
        console.error('Failed to load mascot config:', error)
        // Fallback config
        setConfig({
          ASSETS: { SERVE_PATH: '/assets/mascot/mascot-full.png', HEADER_BADGE: { width: 32, height: 32 } },
          ANIMATIONS: {
            ENTRANCE: { total: 2.0, fadeIn: 0.25, spin: 0.5, settle: 0.45 },
            IDLE: {
              breathing: { duration: 4, scale: { min: 1.0, max: 1.02 } },
              rotation: { duration: 6, angle: { min: -3, max: 3 } },
              glow: { interval: 8, duration: 2 }
            },
            HOVER: {
              wave: { rotation: { start: -12, end: 6 }, duration: 0.6 },
              glow: { intensity: 0.3, duration: 0.4 }
            }
          },
          RESPONSIVE: { desktop: { maxWidth: 280 }, tablet: { maxWidth: 200 }, mobile: { maxWidth: 140 }, small: { maxWidth: 120 } },
          PERFORMANCE: { reduceMotion: true, fallbackIcon: '🧞‍♂️' }
        })
      }
    }

    loadConfig()
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    setMounted(true)
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Preload mascot image
  useEffect(() => {
    if (!config) return

    const img = new Image()
    img.onload = () => {
      setMascotLoaded(true)
      setIsLoading(false)
    }
    img.onerror = () => {
      setMascotError(true)
      setIsLoading(false)
      console.error('Failed to load mascot image')
    }
    img.src = `http://localhost:5001${config.ASSETS.SERVE_PATH}`
  }, [config])

  // Trigger animation on first meaningful interaction
  const triggerAnimation = () => {
    if (!hasTriggeredRef.current && mascotLoaded && !animationTriggered) {
      hasTriggeredRef.current = true
      setAnimationTriggered(true)
    }
  }

  // Handle CTA click with mascot wave and navigation
  const handleEnterTaxGenie = async () => {
    // Trigger entrance animation if not already triggered
    triggerAnimation()
    
    // Wait for entrance animation to complete, then navigate
    const delay = animationTriggered ? 500 : (config?.ANIMATIONS.ENTRANCE.total || 2) * 1000 + 500
    
    setTimeout(() => {
      router.push('/home')
    }, delay)
  }

  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      triggerAnimation()
    }
  }

  // Mascot entrance animation variants
  const mascotVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: 0,
      y: -20
    },
    entrance: {
      opacity: 1,
      scale: [0, 1.05, 1.0],
      rotate: [0, 360, 0],
      y: [0, -10, 0],
      transition: {
        duration: config?.ANIMATIONS.ENTRANCE.total || 2,
        times: [0, 0.7, 1],
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    idle: {
      scale: config?.ANIMATIONS.IDLE.breathing.scale.max || 1.02,
      rotate: [
        config?.ANIMATIONS.IDLE.rotation.angle.min || -3,
        config?.ANIMATIONS.IDLE.rotation.angle.max || 3,
        config?.ANIMATIONS.IDLE.rotation.angle.min || -3
      ],
      transition: {
        scale: {
          duration: config?.ANIMATIONS.IDLE.breathing.duration || 4,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "easeInOut"
        },
        rotate: {
          duration: config?.ANIMATIONS.IDLE.rotation.duration || 6,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "easeInOut"
        }
      }
    },
    hover: {
      rotate: [
        config?.ANIMATIONS.HOVER.wave.rotation.start || -12,
        config?.ANIMATIONS.HOVER.wave.rotation.end || 6,
        0
      ],
      transition: {
        duration: config?.ANIMATIONS.HOVER.wave.duration || 0.6,
        ease: "easeOut"
      }
    }
  }

  // Reduced motion variants
  const reducedMotionVariants = {
    hidden: { opacity: 0 },
    entrance: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    idle: {},
    hover: {}
  }

  if (!mounted || !config) {
    return <MascotLoader />
  }

  return (
    <div className="landing-container" onClick={triggerAnimation} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-overlay"
          >
            <MascotLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Landing Content */}
      <main className="landing-hero">
        {/* Header with small mascot badge */}
        <header className="landing-header">
          <div className="header-content">
            <div className="brand-container">
              {!mascotError ? (
                <img
                  src={`http://localhost:5001/assets/mascot/header-badge.png`}
                  alt=""
                  aria-hidden="true"
                  className="header-mascot-badge"
                  width={config.ASSETS.HEADER_BADGE.width}
                  height={config.ASSETS.HEADER_BADGE.height}
                />
              ) : (
                <span className="header-fallback" aria-hidden="true">
                  {config.PERFORMANCE.fallbackIcon}
                </span>
              )}
              <span className="brand-text" aria-label="Tax Genie — AI tax assistant">
                Tax Genie
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          {/* Mascot Container - Reserve space to prevent layout shift */}
          <div className="mascot-container" style={{ height: '300px' }}>
            <AnimatePresence>
              {mascotLoaded && !mascotError && (
                <motion.div
                  className="mascot-wrapper"
                  variants={prefersReducedMotion ? reducedMotionVariants : mascotVariants}
                  initial="hidden"
                  animate={
                    !animationTriggered 
                      ? "hidden" 
                      : animationTriggered && !isHovering 
                        ? "idle" 
                        : "hover"
                  }
                  onAnimationComplete={(definition) => {
                    if (definition === "entrance") {
                      // Switch to idle after entrance completes
                      setTimeout(() => setAnimationTriggered(true), 100)
                    }
                  }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  <motion.img
                    ref={mascotRef}
                    src={`http://localhost:5001${config.ASSETS.SERVE_PATH}`}
                    alt="Tax Genie mascot — AI tax assistant"
                    className="mascot-image"
                    loading="eager"
                    animate={animationTriggered ? "entrance" : "hidden"}
                    whileHover={!prefersReducedMotion ? "hover" : undefined}
                  />
                  
                  {/* Glow effect */}
                  {!prefersReducedMotion && animationTriggered && (
                    <motion.div
                      className="mascot-glow"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: config.ANIMATIONS.IDLE.glow.duration,
                        repeat: Infinity,
                        repeatDelay: config.ANIMATIONS.IDLE.glow.interval - config.ANIMATIONS.IDLE.glow.duration
                      }}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Fallback if mascot fails to load */}
              {mascotError && (
                <motion.div
                  className="mascot-fallback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="fallback-icon" role="img" aria-label="Tax Genie mascot">
                    {config.PERFORMANCE.fallbackIcon}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hero Content */}
          <div className="hero-content">
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tax Genie
            </motion.h1>
            
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Filing taxes made effortless with your personal AI Genie.
            </motion.p>
            
            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Automate, calculate, and file — faster, smarter, and stress-free.
            </motion.p>
            
            <motion.div
              className="cta-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                className="cta-primary"
                onClick={handleEnterTaxGenie}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleEnterTaxGenie()
                  }
                }}
                whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
                aria-label="Enter Tax Genie application"
              >
                <Sparkles className="cta-icon" aria-hidden="true" />
                Enter Tax Genie
                <ArrowRight className="cta-arrow" aria-hidden="true" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
