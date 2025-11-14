'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, FileText, TrendingUp, Shield, ArrowRight, CheckCircle, Sparkles, Zap, Award, Users, Sun, Moon, UserPlus, Upload, Wand2, Send, ChevronDown, FileCheck, DollarSign, Star, Clock, Target, Database } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Continuous card animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 3)
    }, 5000) // Change card every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{
      background: `linear-gradient(to bottom right, var(--bg-from), var(--bg-via), var(--bg-to))`
    }}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ opacity: theme === 'dark' ? 0.12 : 0.05 }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" style={{ opacity: theme === 'dark' ? 0.12 : 0.05 }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" style={{ opacity: theme === 'dark' ? 0.12 : 0.05 }}></div>
      </div>
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cardFadeIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes textSlideIn {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      {/* Header */}
      <header className="border-b backdrop-blur-xl sticky top-0 z-50 relative transition-colors duration-300" style={{
        borderColor: 'var(--card-border)',
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)'
      }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg blur opacity-60"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-teal-600 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent" style={{
                backgroundImage: `linear-gradient(to right, var(--btn-gradient-start), var(--btn-gradient-end))`
              }}>ITR Platform</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="transition" style={{ color: 'var(--text-secondary)' }}>Features</a>
              <a href="#how-it-works" className="transition" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
              <a href="#pricing" className="transition" style={{ color: 'var(--text-secondary)' }}>Pricing</a>
              <Link href="/login" className="transition" style={{ color: 'var(--text-secondary)' }}>Login</Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                aria-label="Toggle dark mode"
                aria-pressed={theme === 'dark'}
              >
                {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" style={{ color: 'var(--text-primary)' }} /> : <Moon className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />)}
              </button>
              <Link href="/register" className="relative group">
                <div className="relative bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                  Get Started
                </div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - ClearTax Inspired */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="relative z-10" style={{ animation: 'textSlideIn 0.6s ease-out' }}>
            {/* Stats Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6 transition-all hover:scale-105" style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))' 
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.1))',
              border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.25)'}`,
              boxShadow: theme === 'dark' ? '0 4px 20px rgba(16, 185, 129, 0.15)' : '0 2px 10px rgba(5, 150, 105, 0.08)'
            }}>
              <TrendingUp className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#059669' }} />
              <span className="text-sm font-bold" style={{ color: theme === 'dark' ? '#10B981' : '#059669' }}>₹1766.69 Cr</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Refund processed this year</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-outfit text-5xl md:text-6xl font-bold mb-6" style={{ 
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              <span style={{ color: 'var(--text-primary)' }}>Get Maximum</span>
              <br />
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(135deg, #10B981, #14B8A6)'
                  : 'linear-gradient(135deg, #059669, #0D9488)'
              }}>
                Tax Refund
              </span>
            </h1>

            <p className="text-xl mb-8 leading-relaxed" style={{ 
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em'
            }}>
              India's most trusted AI-powered tax filing platform. File your ITR in minutes with 100% accuracy and get maximum refund.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Primary CTA - Self ITR Filing */}
              <Link href="/itr/personal-info" className="relative group flex-1">
                <button className="w-full px-8 py-4 rounded-xl font-semibold text-base text-white transition-all hover:shadow-2xl hover:scale-105 text-center" style={{
                  background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
                  boxShadow: theme === 'dark' ? '0 4px 16px rgba(16, 185, 129, 0.25)' : '0 4px 12px rgba(6, 182, 212, 0.2)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 3s ease infinite',
                  minHeight: '72px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="block">Self ITR Filing</span>
                  <span className="text-xs font-normal mt-1 opacity-90">File in just 4 easy steps</span>
                </button>
              </Link>

              {/* Secondary CTA - Hire an Expert */}
              <Link href="/login" className="relative group flex-1">
                <button className="w-full px-8 py-4 rounded-xl font-semibold text-base transition-all hover:shadow-md hover:scale-105 text-center" style={{
                  border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.3)'}`,
                  backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                  color: theme === 'dark' ? '#34D399' : '#059669',
                  minHeight: '72px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="block">Hire an Expert</span>
                  <span className="text-xs font-normal mt-1 opacity-80">Get professional assistance</span>
                </button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all hover:scale-105" style={{
                backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.15)'}` 
              }}>
                <Shield className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#059669' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all hover:scale-105" style={{
                backgroundColor: theme === 'dark' ? 'rgba(13, 148, 136, 0.1)' : 'rgba(13, 148, 136, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(13, 148, 136, 0.15)'}`
              }}>
                <Sparkles className="h-4 w-4" style={{ color: theme === 'dark' ? '#14B8A6' : '#0D9488' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all hover:scale-105" style={{
                backgroundColor: theme === 'dark' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)',
                border: `1px solid ${theme === 'dark' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.15)'}`
              }}>
                <Award className="h-4 w-4" style={{ color: theme === 'dark' ? '#FB923C' : '#F97316' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Expert Support</span>
              </div>
            </div>
          </div>

          {/* Right Side - Animated Refund Card + Person */}
          <div className="relative hidden lg:block h-[550px]">
            {/* Background Gradient Bubble - Positioned Right */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20" style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(209, 250, 229, 0.15), rgba(167, 243, 208, 0.08), transparent)'
                : 'radial-gradient(circle, rgba(209, 250, 229, 0.7), rgba(167, 243, 208, 0.4), transparent)'
            }}></div>

            {/* Person Image - Your Uploaded Hero Image */}
            <div className="absolute right-0 bottom-0 h-[550px] w-[450px] flex items-end justify-end overflow-hidden">
              <div className="relative h-full w-full">
                {/* Professional woman with tax refund notification */}
                <img 
                  src="/hero-woman.png"
                  alt="Professional woman confidently holding smartphone showing tax refund"
                  className="absolute bottom-0 right-0 h-full w-full object-contain object-bottom transition-all duration-300 hover:scale-105"
                  style={{
                    filter: theme === 'dark' ? 'brightness(0.95) contrast(1.08)' : 'brightness(1.08) contrast(1.02)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectPosition: 'bottom right'
                  }}
                  loading="eager"
                  onError={(e) => {
                    // Show helpful message if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center p-8 backdrop-blur-sm rounded-2xl" style="background: rgba(209, 250, 229, 0.3); border: 2px dashed rgba(5, 150, 105, 0.3);">
                            <div class="text-6xl mb-4">🖼️</div>
                            <div class="text-sm font-semibold" style="color: var(--text-primary);">Image Not Found</div>
                            <div class="text-xs mt-2" style="color: var(--text-secondary);">Looking for: hero-woman.png</div>
                            <div class="text-xs" style="color: var(--text-secondary);">Location: frontend/public/</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>

            {/* Animated Refund Cards - Perfectly aligned to left of person */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[350px]" style={{ animation: 'floatCard 3s ease-in-out infinite' }}>
              {/* Card 1: Deductions List */}
              <div className={`absolute inset-0 transition-all duration-700 ${activeCard === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{
                animation: activeCard === 0 ? 'cardFadeIn 0.6s ease-out' : 'none'
              }}>
                <div className="backdrop-blur-md rounded-2xl p-6 border shadow-lg" style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Auto applying deductions</h3>
                  <div className="space-y-3">
                    {['80C Deductions', 'HRA Benefits', 'Medical Insurance', 'Home Loan Interest'].map((item, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" style={{ color: '#10B981' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Refund Calculation */}
              <div className={`absolute inset-0 transition-all duration-700 ${activeCard === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{
                animation: activeCard === 1 ? 'cardFadeIn 0.6s ease-out' : 'none'
              }}>
                <div className="backdrop-blur-md rounded-2xl p-6 border shadow-lg" style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Total Refund</h3>
                  <div className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{
                    backgroundImage: 'linear-gradient(135deg, #10B981, #059669)'
                  }}>₹1,47,060</div>
                  <div className="space-y-2">
                    {[
                      { label: 'Gross Income', value: '₹22,00,000' },
                      { label: 'Tax Savings', value: '₹4,50,000' },
                      { label: 'Refund', value: '₹1,34,303' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Success Badge */}
              <div className={`absolute inset-0 transition-all duration-700 ${activeCard === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{
                animation: activeCard === 2 ? 'cardFadeIn 0.6s ease-out' : 'none'
              }}>
                <div className="backdrop-blur-md rounded-2xl p-8 border shadow-lg text-center" style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <div className="text-5xl mb-4">🤖</div>
                  <div className="text-3xl font-bold bg-clip-text text-transparent mb-2" style={{
                    backgroundImage: 'linear-gradient(135deg, #10B981, #059669)'
                  }}>₹1,47,060</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Refund Calculated!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Hero-Matched Green-Cyan-Blue */}
      <section 
        id="features" 
        className="relative py-20 px-6 md:px-12 overflow-hidden transition-colors duration-300 text-center" 
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
            : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)' // Mint-aqua Hero tone
        }}
      >
        {/* Floating Gradient Orbs - Green-Cyan Harmony */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 right-20 w-96 h-96 rounded-full mix-blend-multiply"
            style={{
              background: theme === 'dark' 
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1), transparent)'
                : 'radial-gradient(circle, rgba(22, 163, 74, 0.12), rgba(6, 182, 212, 0.08), transparent)',
              filter: 'blur(80px)',
              animation: 'floatOrb 8s ease-in-out infinite alternate'
            }}
          ></div>
          <div 
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full mix-blend-multiply"
            style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(20, 184, 166, 0.15), rgba(6, 182, 212, 0.1), transparent)'
                : 'radial-gradient(circle, rgba(6, 182, 212, 0.12), rgba(37, 99, 235, 0.06), transparent)',
              filter: 'blur(80px)',
              animation: 'floatOrb 8s ease-in-out infinite alternate',
              animationDelay: '4s'
            }}
          ></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Heading Block */}
          <div className="mb-16">
            <h2 
              className="text-3xl md:text-4xl font-medium mb-2"
              style={{ 
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
                letterSpacing: '0.01em'
              }}
            >
              Why Choose Us?
            </h2>
            
            {/* Animated Gradient Underline - Green-Cyan-Blue */}
            <div 
              className="w-10 h-1 mx-auto mb-4 rounded-full"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(to right, #10B981, #06B6D4, #2563EB)'
                  : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)',
                animation: 'gradient-x 3s ease-in-out infinite',
                backgroundSize: '200% 200%'
              }}
            ></div>

            <p 
              className="text-lg max-w-2xl mx-auto font-normal opacity-80"
              style={{ 
                color: theme === 'dark' ? '#D1D5DB' : '#475569',
                letterSpacing: '0.01em'
              }}
            >
              Everything you need to file your ITR with confidence
            </p>
          </div>

          {/* Feature Grid - Glassmorphic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            <Link href="/tax-calculator" className="block h-full">
              <FeatureCard
                icon={<Calculator className="h-12 w-12" />}
                title="Smart Tax Calculator"
                description="AI-powered calculator that compares old vs new regime and recommends the best option for maximum savings."
                iconColor="blue"
                delay={0}
              />
            </Link>
            <Link href="/form16-upload" className="block h-full">
              <FeatureCard
                icon={<FileText className="h-12 w-12" />}
                title="Auto-Fill from Form 16"
                description="Upload your Form 16 and we'll automatically extract and fill all your salary details. No manual entry needed!"
                iconColor="green"
                delay={0.1}
              />
            </Link>
            <Link href="/deduction-optimizer" className="block h-full">
              <FeatureCard
                icon={<TrendingUp className="h-12 w-12" />}
                title="Deduction Optimizer"
                description="Get personalized suggestions to maximize your deductions under 80C, 80D, and other sections."
                iconColor="purple"
                delay={0.2}
              />
            </Link>
            <Link href="/tax-summary" className="block h-full">
              <FeatureCard
                icon={<FileCheck className="h-12 w-12" />}
                title="Tax Summary & Receipt"
                description="View comprehensive tax calculation summary with regime comparison and download professional PDF receipt."
                iconColor="green"
                delay={0.25}
              />
            </Link>
            <Link href="/test-accuracy" className="block h-full">
              <FeatureCard
                icon={<Target className="h-12 w-12" />}
                title="Accuracy Testing"
                description="Comprehensive testing suite to validate mathematical accuracy and ensure reliable tax calculations."
                iconColor="purple"
                delay={0.27}
              />
            </Link>
            <Link href="/data-debug" className="block h-full">
              <FeatureCard
                icon={<Database className="h-12 w-12" />}
                title="Data Debug Console"
                description="Debug and validate data storage across all income and deduction sections with real-time monitoring."
                iconColor="cyan"
                delay={0.29}
              />
            </Link>
            <FeatureCard
              icon={<Shield className="h-12 w-12" />}
              title="100% Secure"
              description="Bank-grade encryption and security. Your data is safe with us and never shared with third parties."
              iconColor="red"
              delay={0.3}
            />
            <FeatureCard
              icon={<CheckCircle className="h-12 w-12" />}
              title="Error-Free Filing"
              description="Advanced validation ensures your return is error-free before submission. No more notices!"
              iconColor="cyan"
              delay={0.4}
            />
            <FeatureCard
              icon={<ArrowRight className="h-12 w-12" />}
              title="One-Click E-Filing"
              description="File directly to the Income Tax portal with just one click. E-verification included."
              iconColor="orange"
              delay={0.5}
            />
          </div>

          {/* Trust Tagline Banner - Green-Cyan-Blue Gradient */}
          <div className="mt-16">
            <p 
              className="text-lg font-normal bg-clip-text text-transparent"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #10B981, #06B6D4, #2563EB)'
                  : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)',
                animation: 'gradient-x 4s ease-in-out infinite',
                backgroundSize: '200% 200%'
              }}
            >
              Trusted by 1M+ taxpayers for fast, accurate, and secure ITR filing.
            </p>
          </div>
        </div>

        {/* Additional CSS Animations */}
        <style>{`
          @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-shimmer {
            background-size: 200% 200%;
            animation: shimmer 3s ease-in-out infinite;
          }
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% auto;
            animation: gradient-x 3s ease infinite;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* How It Works - Hero-Matched Green-Cyan-Blue */}
      <section id="how-it-works" className="relative py-20 px-8 md:px-16 overflow-hidden transition-colors duration-300" style={{
        background: theme === 'dark'
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
          : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)' // Mint-aqua Hero tone
      }}>
        {/* Ambient Background Blobs - Green/Cyan/Blue Hero Harmony */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ opacity: theme === 'dark' ? 0.12 : 0.08 }}></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" style={{ opacity: theme === 'dark' ? 0.12 : 0.08 }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" style={{ opacity: theme === 'dark' ? 0.1 : 0.06 }}></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Title Block */}
          <div className="text-center mb-16">
            {/* Pill Label - Green-Cyan Hero Match */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm animate-shimmer" style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))'
                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(6, 182, 212, 0.06))',
              border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(22, 163, 74, 0.15)'}`,
              boxShadow: theme === 'dark' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(6, 182, 212, 0.08)'
            }}>
              <Zap className="h-4 w-4" style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }} />
              <span style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}>How It Works</span>
            </div>

            {/* Heading with Gradient Text - Green-Cyan-Blue Hero Match */}
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent" style={{
              backgroundImage: theme === 'dark'
                ? 'linear-gradient(135deg, #10B981, #06B6D4)'
                : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)' // Green-Cyan-Blue
            }}>
              File your ITR in 4 simple steps
            </h2>

            {/* Subtext */}
            <p className="text-lg" style={{
              color: theme === 'dark' ? '#D1D5DB' : '#475569'
            }}>
              Quick, easy, and completely guided process
            </p>
          </div>

          {/* Interactive Timeline */}
          <InteractiveTimeline />
        </div>

        {/* Additional CSS Animations */}
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 rgba(6, 182, 212, 0); }
            50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.15); }
          }
          @keyframes line-fill {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.06); opacity: 0.8; }
          }
          @keyframes expandIn {
            from {
              opacity: 0;
              max-height: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              max-height: 500px;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Key Metrics Section - Hero-Matched Green-Cyan Palette */}
      <section 
        className="relative py-20 overflow-hidden transition-colors duration-300 text-center" 
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom, #0f172a, #1e293b)' 
            : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)' // Mint-aqua gradient
        }}
        aria-label="Key metrics"
      >
        <div className="container mx-auto max-w-7xl px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard
              value="10,000"
              suffix="+"
              label="Returns Filed"
              gradientFrom="from-green-500"
              gradientVia="via-teal-400"
              gradientTo="to-cyan-400"
              orbColors="from-green-500 via-teal-400 to-cyan-300"
              delay={0}
            />
            <MetricCard
              value="50"
              prefix="₹"
              suffix=" Cr+"
              label="Tax Savings"
              gradientFrom="from-emerald-500"
              gradientVia="via-cyan-400"
              gradientTo="to-blue-400"
              orbColors="from-emerald-500 via-cyan-400 to-blue-300"
              delay={0.2}
            />
            <MetricCard
              value="4.9"
              suffix="/5"
              label="User Rating"
              gradientFrom="from-teal-400"
              gradientVia="via-cyan-400"
              gradientTo="to-blue-500"
              orbColors="from-teal-400 via-cyan-400 to-blue-300"
              delay={0.4}
            />
            <MetricCard
              value="10"
              prefix="< "
              suffix=" min"
              label="Avg Filing Time"
              gradientFrom="from-green-400"
              gradientVia="via-cyan-500"
              gradientTo="to-blue-500"
              orbColors="from-green-400 via-cyan-500 to-blue-300"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Hero-Matched Green-Cyan-Blue */}
      <section className="my-20 px-6">
        <div className="container mx-auto max-w-6xl relative">
          <div 
            className="relative rounded-3xl py-16 px-6 md:px-12 text-center overflow-hidden"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(to right, #047857, #0891b2, #1e40af)'
                : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)', // Green-Cyan-Blue Hero match
              boxShadow: theme === 'dark'
                ? '0 15px 50px rgba(16, 185, 129, 0.25)'
                : '0 15px 50px rgba(22, 163, 74, 0.18)'
            }}
          >
            {/* Floating Gradient Orbs - Green-Cyan-Blue */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute bottom-0 left-10 w-64 h-64 rounded-full"
                style={{
                  background: theme === 'dark'
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4), rgba(6, 182, 212, 0.3), transparent)'
                    : 'radial-gradient(circle, rgba(22, 163, 74, 0.35), rgba(6, 182, 212, 0.25), transparent)',
                  filter: 'blur(80px)',
                  animation: 'floatOrb 6s ease-in-out infinite alternate'
                }}
              ></div>
              <div 
                className="absolute top-0 right-10 w-64 h-64 rounded-full"
                style={{
                  background: theme === 'dark'
                    ? 'radial-gradient(circle, rgba(6, 182, 212, 0.4), rgba(37, 99, 235, 0.25), transparent)'
                    : 'radial-gradient(circle, rgba(6, 182, 212, 0.3), rgba(37, 99, 235, 0.2), transparent)',
                  filter: 'blur(80px)',
                  animation: 'floatOrb 6s ease-in-out infinite alternate',
                  animationDelay: '3s'
                }}
              ></div>
            </div>

            {/* Glass Reflection Layer */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, transparent, rgba(255, 255, 255, 0.1))'
              }}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              <h2 
                className="text-3xl md:text-4xl font-semibold mb-4 text-white"
                style={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  animation: 'fadeInUp 0.8s ease-out'
                }}
              >
                Ready to File Your ITR?
              </h2>
              <p 
                className="text-lg mb-8 opacity-90"
                style={{
                  color: '#E0F2FE',
                  animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
                }}
              >
                Join thousands of happy taxpayers who saved time and money
              </p>
              <Link href="/register">
                <button 
                  className="group/cta mt-8 px-6 py-3 rounded-xl bg-white text-blue-600 font-medium shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto hover:scale-105 active:scale-[0.98]"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 0.4s backwards, pulse 2.5s ease-in-out infinite alternate'
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                  Start Filing Now - It's Free!
                  <ArrowRight className="h-5 w-5 group-hover/cta:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Light, Clean Design */}
      <footer 
        className="relative pt-16 pb-10 px-6 md:px-12 transition-colors duration-300"
        style={{
          background: theme === 'dark' ? '#0f172a' : '#F1F6FA',
          borderTop: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.08)'}`,
          boxShadow: theme === 'dark' ? 'none' : '0 -5px 20px rgba(37, 99, 235, 0.05)'
        }}
      >
        {/* Animated Gradient Line - Green-Cyan-Blue Hero Match */}
        <div 
          className="absolute top-0 left-0 h-1"
          style={{
            width: '100%',
            background: theme === 'dark'
              ? 'linear-gradient(to right, #10B981, #06B6D4, #2563EB)'
              : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)',
            animation: 'gradient-x 6s ease-in-out infinite alternate'
          }}
        ></div>

        <div className="container mx-auto max-w-7xl">
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText 
                  className="h-7 w-7"
                  style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}
                />
                <span 
                  className="font-semibold text-lg"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
                >
                  ITR Platform
                </span>
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
              >
                Making tax filing simple, accurate, and stress-free for everyone.
              </p>
            </div>

            {/* Product Links */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.1s backwards' }}>
              <h3 
                className="font-semibold mb-3"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              >
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#features" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link 
                    href="/tax-calculator" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Tax Calculator
                  </Link>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}>
              <h3 
                className="font-semibold mb-3"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              >
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
              <h3 
                className="font-semibold mb-3"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              >
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:underline hover:decoration-2"
                    style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div 
            className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-sm"
            style={{
              borderTop: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.08)'}`,
              color: theme === 'dark' ? '#94A3B8' : '#475569'
            }}
          >
            <p>© 2025 ITR Platform. All rights reserved.</p>
            <div className="flex gap-4 mt-3 md:mt-0">
              <a 
                href="#" 
                className="transition-colors hover:underline"
                onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="transition-colors hover:underline"
                onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#10B981' : '#16A34A'}
                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#94A3B8' : '#475569'}
              >
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes pulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1); }
            50% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.3), 0 0 60px rgba(255, 255, 255, 0.5); }
          }
        `}</style>
      </footer>
    </div>
  )
}

// FeatureCard Component - Hero-Matched Glassmorphic Design
function FeatureCard({ icon, title, description, iconColor, delay }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  iconColor: 'blue' | 'green' | 'purple' | 'red' | 'cyan' | 'orange',
  delay: number
}) {
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000 + 200)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className="group relative h-full"
      style={{
        animation: isVisible ? `fadeInUp 0.6s ease-out forwards` : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'
      }}
    >
      {/* Glassmorphic Card */}
      <div 
        className="relative p-8 rounded-2xl backdrop-blur-md border transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col h-full text-left"
        style={{
          background: theme === 'dark'
            ? 'rgba(30, 41, 59, 0.5)'
            : 'rgba(255, 255, 255, 0.8)', // Soft glassmorphic
          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)'}`, // Subtle border
          boxShadow: theme === 'dark'
            ? '0 8px 25px rgba(0, 0, 0, 0.3)'
            : '0 8px 25px rgba(37, 99, 235, 0.04)' // Gentle shadow
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? '0 15px 40px rgba(16, 185, 129, 0.15)'
            : '0 15px 40px rgba(6, 182, 212, 0.08)' // Green-cyan glow on hover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? '0 8px 25px rgba(0, 0, 0, 0.3)'
            : '0 8px 25px rgba(6, 182, 212, 0.06)'
        }}
      >
        {/* Icon with Gradient Background - Green-Cyan Hero Match */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-6 group-hover:scale-105 transition-transform duration-300"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
              : 'linear-gradient(135deg, #16A34A, #06B6D4)',
            boxShadow: theme === 'dark'
              ? '0 4px 20px rgba(16, 185, 129, 0.25)'
              : '0 4px 20px rgba(22, 163, 74, 0.2)',
            animation: 'glow 3s ease-in-out infinite alternate'
          }}
        >
          {icon}
        </div>

        {/* Title - Refined Typography */}
        <h3 
          className="text-lg font-semibold mb-2"
          style={{
            color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
            letterSpacing: '0.01em'
          }}
        >
          {title}
        </h3>

        {/* Description - Light Typography */}
        <p 
          className="text-sm leading-relaxed opacity-90"
          style={{
            color: theme === 'dark' ? '#D1D5DB' : '#475569',
            fontWeight: 400,
            letterSpacing: '0.01em'
          }}
        >
          {description}
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes glow {
          0%, 100% { 
            opacity: 1; 
            filter: brightness(1); 
          }
          50% { 
            opacity: 0.85; 
            filter: brightness(1.15); 
          }
        }
      `}</style>
    </div>
  )
}

// Interactive Timeline Component
function InteractiveTimeline() {
  const { theme } = useTheme()
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    {
      number: 1,
      icon: <UserPlus className="h-6 w-6" />,
      title: "Create Account",
      description: "Sign up in 30 seconds with email or Google",
      color: { light: '#16A34A', dark: '#10B981', bg: 'rgba(22, 163, 74, 0.1)' },
      details: ["Enter your email", "Verify OTP", "Set password"]
    },
    {
      number: 2,
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Documents",
      description: "Upload Form 16 or drag & drop payslips",
      color: { light: '#14B8A6', dark: '#14B8A6', bg: 'rgba(20, 184, 166, 0.1)' },
      details: ["Upload Form 16", "Auto-extract data", "Verify details"]
    },
    {
      number: 3,
      icon: <Wand2 className="h-6 w-6" />,
      title: "Review & Optimize",
      description: "AI suggests best regime & deductions",
      color: { light: '#06B6D4', dark: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)' },
      details: ["Compare regimes", "Add deductions", "Maximize refund"]
    },
    {
      number: 4,
      icon: <Send className="h-6 w-6" />,
      title: "File & Verify",
      description: "One-click e-file + e-verify",
      color: { light: '#2563EB', dark: '#3B82F6', bg: 'rgba(37, 99, 235, 0.1)' },
      details: ["Review summary", "Submit to IT portal", "E-verify instantly"]
    }
  ]

  return (
    <div className="relative">
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden lg:block">
        {/* Progress Line Container */}
        <div className="relative mb-8">
          <div className="absolute top-9 left-0 right-0 h-1.5 rounded-full\" style={{
            background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.2)'
          }}></div>
          {/* Animated Fill Line */}
          <div 
            className="absolute top-9 left-0 h-1.5 rounded-full transition-all duration-1000"
            style={{
              width: isVisible ? '100%' : '0%',
              background: theme === 'dark'
                ? 'linear-gradient(to right, #10B981, #06B6D4, #3B82F6)'
                : 'linear-gradient(to right, #16A34A, #06B6D4, #2563EB)',
              animation: isVisible ? 'line-fill 2s ease-out' : 'none'
            }}
          ></div>
        </div>

        {/* Steps Container */}
        <div className="grid grid-cols-4 gap-6 auto-rows-fr items-stretch">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col"
              style={{
                animation: isVisible ? `fadeInUp 0.55s ease-out ${index * 0.15}s forwards` : 'none',
                opacity: isVisible ? 1 : 0
              }}
            >
              {/* Step Marker */}
              <div 
                className="relative mb-6 mx-auto w-10 h-10 cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation() // Prevent event bubbling
                  // Only one card expands at a time
                  setExpandedStep(prev => prev === step.number ? null : step.number)
                }}
                onMouseEnter={() => setHoveredStep(step.number)}
                onMouseLeave={() => setHoveredStep(null)}
                role="button"
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                {/* Neutral Marker Circle */}
                <div 
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'transparent',
                    color: theme === 'dark' ? '#94A3B8' : '#475569',
                    boxShadow: hoveredStep === step.number
                      ? '0 2px 8px rgba(0, 0, 0, 0.08)'
                      : 'none'
                  }}
                >
                  {step.number}
                </div>

              </div>

              {/* Step Card - Matches Hero Surface Style */}
              <div 
                className="relative backdrop-blur-md rounded-2xl p-6 md:p-8 cursor-pointer flex flex-col flex-grow focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none will-change-transform"
                tabIndex={0}
                role="button"
                aria-expanded={expandedStep === step.number}
                aria-controls={`step-content-${step.number}`}
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))'
                    : 'rgba(255, 255, 255, 0.85)', // Exact Hero surface opacity
                  border: expandedStep === step.number
                    ? `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`
                    : `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)'}`,
                  boxShadow: expandedStep === step.number
                    ? theme === 'dark'
                      ? '0 12px 40px rgba(16, 185, 129, 0.25)'
                      : '0 12px 40px rgba(6, 182, 212, 0.12)'
                    : hoveredStep === step.number
                      ? theme === 'dark'
                        ? '0 8px 24px rgba(6, 182, 212, 0.15)'
                        : '0 8px 24px rgba(6, 182, 212, 0.08)'
                      : theme === 'dark'
                        ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                        : '0 4px 16px rgba(6, 182, 212, 0.04)',
                  transform: hoveredStep === step.number ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.35s ease-out', // Smooth 0.35s transition
                  minHeight: '240px',
                  outline: 'none'
                }}
                onMouseEnter={() => setHoveredStep(step.number)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={(e) => {
                  e.stopPropagation() // Prevent event bubbling
                  setExpandedStep(prev => prev === step.number ? null : step.number)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    setExpandedStep(prev => prev === step.number ? null : step.number)
                  }
                }}
              >
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200"
                  style={{
                    background: step.color.bg,
                    color: theme === 'dark' ? step.color.dark : step.color.light
                  }}
                >
                  {step.icon}
                </div>

                {/* Title - Matches Hero Text Primary */}
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }} // Exact Hero primary
                >
                  {step.title}
                </h3>

                {/* Description - Matches Hero Text Secondary */}
                <p 
                  className="text-sm leading-relaxed mb-4 flex-grow"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }} // Exact Hero secondary
                >
                  {step.description}
                </p>

                {/* Expanded Details - Only renders for THIS card when active */}
                {expandedStep === step.number && (
                  <div 
                    id={`step-content-${step.number}`}
                    className="mt-4 pt-4 border-t overflow-hidden"
                    style={{
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                      animation: 'expandIn 0.35s ease-out forwards'
                    }}
                  >
                    {step.details.map((detail, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center space-x-2 mb-2"
                        style={{
                          animation: `fadeIn 0.35s ease-out ${idx * 0.05}s forwards`,
                          opacity: 0
                        }}
                      >
                        <CheckCircle className="h-4 w-4" style={{ color: step.color.light }} />
                        <span 
                          className="text-sm"
                          style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}
                        >
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Decorative Expand Icon - Smooth rotation */}
                <div className="flex items-center justify-center mt-2">
                  <ChevronDown 
                    className="h-4 w-4"
                    style={{
                      color: theme === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(22, 163, 74, 0.4)',
                      transform: expandedStep === step.number ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease-in-out' // Smooth 0.3s rotation
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet: Vertical Timeline */}
      <div className="lg:hidden space-y-6">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="relative flex gap-4"
            style={{
              animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.12}s forwards` : 'none',
              opacity: isVisible ? 1 : 0
            }}
          >
            {/* Left: Marker */}
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: theme === 'dark'
                    ? `linear-gradient(135deg, ${step.color.dark}, ${step.color.light})`
                    : `linear-gradient(135deg, ${step.color.light}, ${step.color.dark})`,
                  boxShadow: `0 4px 15px ${step.color.light}30`
                }}
              >
                <span className="text-white font-bold text-lg">{step.number}</span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className="w-0.5 flex-grow mt-2"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3))'
                      : 'linear-gradient(to bottom, rgba(22, 163, 74, 0.2), rgba(6, 182, 212, 0.2))',
                    minHeight: '40px'
                  }}
                ></div>
              )}
            </div>

            {/* Right: Card */}
            <div 
              className="flex-1 backdrop-blur-md rounded-2xl p-6"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))'
                  : 'rgba(255, 255, 255, 0.85)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                boxShadow: theme === 'dark'
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                  : '0 10px 30px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: step.color.bg,
                  color: theme === 'dark' ? step.color.dark : step.color.light
                }}
              >
                {step.icon}
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              >
                {step.title}
              </h3>
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// MetricCard Component - Light, Elegant Design
function MetricCard({ 
  value, 
  prefix = '', 
  suffix = '', 
  label,
  gradientFrom,
  gradientVia,
  gradientTo,
  orbColors,
  delay = 0 
}: { 
  value: string, 
  prefix?: string, 
  suffix?: string, 
  label: string,
  gradientFrom: string,
  gradientVia: string,
  gradientTo: string,
  orbColors: string,
  delay?: number 
}) {
  const { theme } = useTheme()
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [inView, setInView] = useState(false)
  
  // Parse numeric value for animation
  const numericValue = parseFloat(value.replace(/,/g, ''))
  
  // Intersection Observer for count-up trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !inView) {
            setInView(true)
          }
        })
      },
      { threshold: 0.3 }
    )
    
    const element = document.getElementById(`metric-${label.replace(/\s/g, '-')}`)
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [label, inView])
  
  // Count-up animation with requestAnimationFrame (1.2s for smooth feel)
  useEffect(() => {
    if (!inView) return
    
    let startTime: number | null = null
    const duration = 1200 // 1.2s animation
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Ease-out cubic for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)
      
      const current = easedProgress * numericValue
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    
    requestAnimationFrame(step)
  }, [inView, numericValue])
  
  // Entrance animation delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])
  
  // Format display value
  const formatValue = (val: number) => {
    if (label.includes('Rating')) {
      return val.toFixed(1)
    }
    if (val >= 1000) {
      return val.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    }
    return Math.floor(val).toString()
  }
  
  return (
    <article
      id={`metric-${label.replace(/\s/g, '-')}`}
      className="relative p-6 md:p-8 rounded-2xl backdrop-blur-md border transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] focus-visible:ring-1 focus-visible:ring-[rgba(37,99,235,0.15)] focus-visible:outline-none group"
      tabIndex={0}
      role="article"
      aria-label={`${prefix}${value}${suffix} ${label}`}
      style={{
        background: theme === 'dark'
          ? 'rgba(30, 41, 59, 0.5)'
          : 'rgba(255, 255, 255, 0.8)', // Soft glassmorphic
        border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)'}`, // Soft border
        boxShadow: theme === 'dark'
          ? '0 8px 25px rgba(0, 0, 0, 0.3)'
          : '0 8px 25px rgba(37, 99, 235, 0.04)', // Gentle shadow
        animation: isVisible ? `fadeInUp 0.6s ease-out ${delay}s forwards` : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)'
      }}
    >
      {/* Floating Gradient Orb */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl"
        style={{ zIndex: 0 }}
      >
        <div 
          className={`w-40 h-40 bg-gradient-to-r ${orbColors} rounded-full transition-all duration-300 group-hover:opacity-50`}
          style={{
            filter: 'blur(80px)',
            opacity: theme === 'dark' ? 0.2 : 0.3,
            animation: 'floatOrb 4s ease-in-out infinite alternate'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <h3 
          className={`text-3xl md:text-4xl font-semibold bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo} bg-clip-text text-transparent mb-2 transition-all duration-300`}
          style={{
            lineHeight: '1.2'
          }}
        >
          {prefix}{inView ? formatValue(displayValue) : '0'}{suffix}
        </h3>
        <p 
          className="text-sm opacity-80"
          style={{ 
            color: theme === 'dark' ? '#94A3B8' : '#475569',
            fontWeight: 400
          }}
        >
          {label}
        </p>
      </div>

      <style jsx>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </article>
  )
}
