'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Wand2, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import './landing.css'

export default function TaxGenieLanding() {
  const [mounted, setMounted] = useState(false)
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

  const handleEnterTaxGenie = async () => {
    // Trigger mascot whoosh animation
    const mascotWrap = document.querySelector('.mascot-wrap') as HTMLElement
    if (mascotWrap && !prefersReducedMotion) {
      mascotWrap.style.transform = 'translateX(18px) scale(1.06)'
      mascotWrap.style.transition = 'transform 220ms ease'
    }

    // Wait for animation then navigate
    setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams)
      const queryString = currentParams.toString()
      const targetUrl = queryString ? `/home?${queryString}` : '/home'
      router.push(targetUrl)
    }, 220)
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="landing-container">
      <section className="landing-hero">
        <div className="hero-left">
          <h1 className="hero-headline">Tax Genie</h1>
          <h2 className="hero-tagline">Filing taxes made effortless with your personal AI Genie.</h2>
          <p className="hero-subtext">Automate, calculate, and file — faster, smarter, and stress-free.</p>
          
          <div className="hero-ctas">
            <button 
              className="cta-primary"
              onClick={handleEnterTaxGenie}
              onKeyDown={(e) => handleKeyDown(e, handleEnterTaxGenie)}
              tabIndex={0}
            >
              <Wand2 className="cta-icon" />
              Enter Tax Genie
              <ArrowRight className="cta-arrow" />
            </button>
            
            <button className="cta-secondary" tabIndex={0}>
              <span>How It Works</span>
              <ChevronDown className="cta-icon" />
            </button>
          </div>
        </div>

        <div className="hero-right">
          <figure className="mascot-wrap">
            <img 
              src="/assets/mascot/mascot-full.png"
              srcSet="/assets/mascot/mascot-full.png 1x"
              alt="Tax Genie mascot — AI tax assistant"
              loading="lazy"
              className={`mascot-image ${prefersReducedMotion ? 'no-animation' : ''}`}
            />
          </figure>
        </div>
      </section>
    </div>
  )
}
