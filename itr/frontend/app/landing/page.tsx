'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Wand2, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function TaxGenieLanding() {
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleEnterTaxGenie = () => {
    setIsTransitioning(true)
    
    // Preserve query params and navigate to homepage
    const currentParams = new URLSearchParams(searchParams)
    const queryString = currentParams.toString()
    const targetUrl = queryString ? `/home?${queryString}` : '/home'
    
    setTimeout(() => {
      router.push(targetUrl)
    }, 800)
  }

  const scrollToHowItWorks = () => {
    setShowHowItWorks(true)
    setTimeout(() => {
      document.getElementById('how-it-works')?.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="landing-container">
      <AnimatePresence>
        {!isTransitioning ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="landing-hero"
          >
            {/* Hero Section */}
            <div className="landing-hero-content">
              <div className="landing-grid">
                
                {/* Left Column - Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="landing-content"
                >
                  {/* Brand Name */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="landing-title"
                  >
                    Tax Genie
                  </motion.h1>

                  {/* Tagline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="landing-tagline"
                  >
                    Filing taxes made effortless with your personal AI Genie.
                  </motion.h2>

                  {/* Subtext */}
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="landing-subtext"
                  >
                    Automate, calculate, and file — faster, smarter, and stress-free.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="landing-cta-container"
                  >
                    {/* Primary CTA */}
                    <motion.button
                      onClick={handleEnterTaxGenie}
                      className="landing-cta-primary"
                      whileHover={!prefersReducedMotion ? { 
                        scale: 1.05,
                        boxShadow: '0 12px 40px rgba(5, 150, 105, 0.6)'
                      } : {}}
                      whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                    >
                      <span className="landing-cta-content">
                        <Wand2 className="landing-cta-icon" />
                        Enter Tax Genie
                        <ArrowRight className="landing-cta-arrow" />
                      </span>
                    </motion.button>

                    {/* Secondary CTA */}
                    <motion.button
                      onClick={scrollToHowItWorks}
                      className="landing-cta-secondary"
                      whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
                      whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                    >
                      <span className="landing-cta-content">
                        How It Works
                        <ChevronDown className="landing-cta-icon" />
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Right Column - Mascot */}
                <motion.div
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="landing-mascot-container"
                >
                  {/* Glow Effect Behind Mascot */}
                  {!prefersReducedMotion && (
                    <motion.div
                      className="landing-mascot-glow"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Mascot Image Container */}
                  <motion.div
                    className="landing-mascot-wrapper"
                    animate={!prefersReducedMotion ? {
                      y: [0, -6, 0, 6, 0],
                      scale: [0.98, 1.02, 0.98, 1.02, 0.98]
                    } : {}}
                    transition={!prefersReducedMotion ? {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                    whileHover={!prefersReducedMotion ? {
                      rotate: [0, 4, -4, 0],
                      transition: { duration: 0.6 }
                    } : {}}
                  >
                    <Image
                      src="/assets/mascot/mascot-full.png"
                      alt="Tax Genie mascot — AI tax assistant"
                      width={420}
                      height={420}
                      className="landing-mascot-image"
                      priority
                      sizes="(max-width: 768px) 220px, (max-width: 1024px) 320px, 420px"
                    />

                    {/* Tax Sheet with Hover Glow */}
                    <motion.div
                      className="landing-tax-sheet"
                      whileHover={!prefersReducedMotion ? {
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                        transition: { duration: 0.3 }
                      } : {}}
                    >
                      <div className="landing-tax-sheet-content">📊</div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* How It Works Section */}
            <AnimatePresence>
              {showHowItWorks && (
                <motion.div
                  id="how-it-works"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ duration: 0.8 }}
                  className="landing-how-it-works"
                >
                  <div className="landing-how-it-works-content">
                    <h3 className="landing-how-it-works-title">
                      How Tax Genie Works
                    </h3>
                    
                    <div className="landing-steps-grid">
                      {[
                        {
                          step: "1",
                          title: "Upload Documents",
                          description: "Simply upload your tax documents and let our AI scan and extract all the information.",
                          icon: "📄"
                        },
                        {
                          step: "2", 
                          title: "AI Magic",
                          description: "Our Tax Genie analyzes your data, finds deductions, and optimizes your tax savings.",
                          icon: "🪄"
                        },
                        {
                          step: "3",
                          title: "File & Relax",
                          description: "Review, approve, and file your return. Get your refund faster than ever before.",
                          icon: "✨"
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.2 }}
                          className="landing-step-card"
                        >
                          <div className="landing-step-icon">{item.icon}</div>
                          <div className="landing-step-number">{item.step}</div>
                          <h4 className="landing-step-title">{item.title}</h4>
                          <p className="landing-step-description">{item.description}</p>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      onClick={handleEnterTaxGenie}
                      className="landing-final-cta"
                      whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
                      whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
                    >
                      <span className="landing-cta-content">
                        <Wand2 className="landing-cta-icon" />
                        Start Your Tax Journey
                        <ArrowRight className="landing-cta-icon" />
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 1.06,
              x: -50
            }}
            transition={{ duration: 0.8 }}
            className="landing-transition"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
              className="landing-transition-icon"
            >
              🪄
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 25%, #E6FFFA 50%, #F0F9FF 75%, #EFF6FF 100%);
          overflow-x: hidden;
        }

        .landing-hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .landing-hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .landing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .landing-content {
          text-align: left;
        }

        .landing-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #059669, #0891B2, #2563EB);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
          line-height: 1.1;
        }

        .landing-tagline {
          font-size: 1.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .landing-subtext {
          font-size: 1.125rem;
          color: #6B7280;
          margin-bottom: 2rem;
          max-width: 500px;
          line-height: 1.6;
        }

        .landing-cta-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .landing-cta-primary {
          background: linear-gradient(135deg, #059669, #0891B2, #2563EB);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(5, 150, 105, 0.4);
          position: relative;
          overflow: hidden;
          max-width: 280px;
        }

        .landing-cta-secondary {
          background: transparent;
          color: #059669;
          border: 2px solid #059669;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          max-width: 280px;
        }

        .landing-cta-secondary:hover {
          background: rgba(5, 150, 105, 0.05);
        }

        .landing-cta-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .landing-cta-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .landing-cta-arrow {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.3s ease;
        }

        .landing-cta-primary:hover .landing-cta-arrow {
          transform: translateX(4px);
        }

        .landing-mascot-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .landing-mascot-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, #10B981, transparent 70%);
          filter: blur(40px);
          border-radius: 50%;
        }

        .landing-mascot-wrapper {
          position: relative;
          z-index: 10;
          max-width: 420px;
          width: 100%;
        }

        .landing-mascot-image {
          width: 100%;
          height: auto;
          object-fit: contain;
          drop-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .landing-tax-sheet {
          position: absolute;
          top: 25%;
          right: 20%;
          width: 4rem;
          height: 4rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid #D1FAE5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .landing-tax-sheet-content {
          font-size: 1.5rem;
        }

        .landing-how-it-works {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,253,244,0.9));
          backdrop-filter: blur(10px);
          padding: 5rem 2rem;
          margin-top: 2rem;
        }

        .landing-how-it-works-content {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .landing-how-it-works-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 3rem;
        }

        .landing-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .landing-step-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #D1FAE5;
          text-align: center;
        }

        .landing-step-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .landing-step-number {
          width: 2rem;
          height: 2rem;
          background: #059669;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          margin: 0 auto 1rem;
        }

        .landing-step-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .landing-step-description {
          color: #6B7280;
          line-height: 1.6;
        }

        .landing-final-cta {
          background: linear-gradient(135deg, #059669, #0891B2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(5, 150, 105, 0.4);
        }

        .landing-transition {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F0FDF4, #ECFDF5, #E6FFFA, #F0F9FF, #EFF6FF);
        }

        .landing-transition-icon {
          font-size: 4rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .landing-grid {
            gap: 2rem;
          }
          
          .landing-mascot-wrapper {
            max-width: 320px;
          }
          
          .landing-title {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .landing-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          
          .landing-content {
            text-align: center;
            order: 1;
          }
          
          .landing-mascot-container {
            order: 2;
          }
          
          .landing-mascot-wrapper {
            max-width: 220px;
          }
          
          .landing-title {
            font-size: 2.5rem;
          }
          
          .landing-tagline {
            font-size: 1.5rem;
          }
          
          .landing-cta-container {
            align-items: center;
          }
          
          .landing-steps-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
