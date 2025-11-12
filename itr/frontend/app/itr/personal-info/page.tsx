'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import ITRStepper from '../components/ITRStepper'
import { User, Phone, Mail, MapPin, CreditCard, ChevronDown, ChevronUp, ArrowRight, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PersonalInfoData {
  firstName: string
  middleName: string
  lastName: string
  dob: string
  fatherName: string
  aadhaar: string
  pan: string
  mobile: string
  email: string
  doorNo: string
  street: string
  locality: string
  pincode: string
  city: string
  state: string
  country: string
}

export default function PersonalInfoPage() {
  const { theme } = useTheme()
  const router = useRouter()
  
  const [formData, setFormData] = useState<PersonalInfoData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    fatherName: '',
    aadhaar: '',
    pan: '',
    mobile: '',
    email: '',
    doorNo: '',
    street: '',
    locality: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India'
  })

  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    identification: true,
    address: true
  })

  const [errors, setErrors] = useState<Partial<PersonalInfoData>>({})

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const validateForm = () => {
    const newErrors: Partial<PersonalInfoData> = {}
    
    // Only validate required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    
    // Validate PAN only if provided
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan)) {
      newErrors.pan = 'Valid PAN format required (e.g., ABCDE1234F)'
    }
    
    // Validate Aadhaar only if provided
    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar.replace(/\s/g, ''))) {
      newErrors.aadhaar = 'Valid 12-digit Aadhaar required'
    }
    
    // Validate mobile only if provided
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Valid 10-digit mobile number required'
    }
    
    // Validate email only if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Save to backend (optional - navigate even if it fails)
      try {
        const response = await fetch('/api/itr/personal-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        // Navigate to next step regardless of API response
        router.push('/itr/income-sources')
      } catch (error) {
        console.error('Failed to save personal info:', error)
        // Still navigate to next step even if API fails
        router.push('/itr/income-sources')
      }
    }
  }

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: theme === 'dark'
        ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
        : 'linear-gradient(to bottom, #F3FAF7, #E6F9F8, #F8FBFF)'
    }}>
      <ITRStepper />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)'
              }}>
                Personal Information
              </h1>
              <p className="mb-8" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                Let's start with your basic details
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info Section */}
                <FormSection
                  title="Personal Details"
                  icon={<User className="h-5 w-5" />}
                  isExpanded={expandedSections.personal}
                  onToggle={() => toggleSection('personal')}
                  theme={theme}
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <InputField
                      label="First Name"
                      value={formData.firstName}
                      onChange={(v) => handleChange('firstName', v)}
                      error={errors.firstName}
                      required
                      theme={theme}
                    />
                    <InputField
                      label="Middle Name"
                      value={formData.middleName}
                      onChange={(v) => handleChange('middleName', v)}
                      theme={theme}
                    />
                    <InputField
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(v) => handleChange('lastName', v)}
                      error={errors.lastName}
                      required
                      theme={theme}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Date of Birth"
                      type="date"
                      value={formData.dob}
                      onChange={(v) => handleChange('dob', v)}
                      error={errors.dob}
                      theme={theme}
                    />
                    <InputField
                      label="Father's Name"
                      value={formData.fatherName}
                      onChange={(v) => handleChange('fatherName', v)}
                      theme={theme}
                    />
                  </div>
                </FormSection>

                {/* Identification Section */}
                <FormSection
                  title="Identification & Contact"
                  icon={<CreditCard className="h-5 w-5" />}
                  isExpanded={expandedSections.identification}
                  onToggle={() => toggleSection('identification')}
                  theme={theme}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="PAN"
                      value={formData.pan}
                      onChange={(v) => handleChange('pan', v.toUpperCase())}
                      error={errors.pan}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      theme={theme}
                    />
                    <InputField
                      label="Aadhaar Number"
                      value={formData.aadhaar}
                      onChange={(v) => handleChange('aadhaar', v)}
                      error={errors.aadhaar}
                      placeholder="1234 5678 9012"
                      maxLength={12}
                      theme={theme}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Mobile Number"
                      type="tel"
                      value={formData.mobile}
                      onChange={(v) => handleChange('mobile', v)}
                      error={errors.mobile}
                      placeholder="9876543210"
                      maxLength={10}
                      theme={theme}
                    />
                    <InputField
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(v) => handleChange('email', v)}
                      error={errors.email}
                      placeholder="you@example.com"
                      theme={theme}
                    />
                  </div>
                </FormSection>

                {/* Address Section */}
                <FormSection
                  title="Address"
                  icon={<MapPin className="h-5 w-5" />}
                  isExpanded={expandedSections.address}
                  onToggle={() => toggleSection('address')}
                  theme={theme}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Door/Flat No"
                      value={formData.doorNo}
                      onChange={(v) => handleChange('doorNo', v)}
                      theme={theme}
                    />
                    <InputField
                      label="Street/Road"
                      value={formData.street}
                      onChange={(v) => handleChange('street', v)}
                      theme={theme}
                    />
                  </div>
                  <InputField
                    label="Locality/Area"
                    value={formData.locality}
                    onChange={(v) => handleChange('locality', v)}
                    theme={theme}
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <InputField
                      label="Pincode"
                      value={formData.pincode}
                      onChange={(v) => handleChange('pincode', v)}
                      error={errors.pincode}
                      maxLength={6}
                      theme={theme}
                    />
                    <InputField
                      label="City"
                      value={formData.city}
                      onChange={(v) => handleChange('city', v)}
                      theme={theme}
                    />
                    <InputField
                      label="State"
                      value={formData.state}
                      onChange={(v) => handleChange('state', v)}
                      theme={theme}
                    />
                  </div>
                </FormSection>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:shadow-2xl hover:scale-105"
                    style={{
                      background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
                      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    Continue to Income Sources
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right: Help Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="rounded-2xl backdrop-blur-md border p-6" style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)',
                boxShadow: '0 10px 25px rgba(6, 182, 212, 0.08)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5" style={{ color: '#16A34A' }} />
                  <h3 className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                    Need Help?
                  </h3>
                </div>
                <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}>
                  Our tax experts are here to assist you with your ITR filing.
                </p>
                <button className="w-full px-4 py-3 rounded-lg font-medium transition-all" style={{
                  border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`,
                  backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(22, 163, 74, 0.05)',
                  color: theme === 'dark' ? '#34D399' : '#16A34A'
                }}>
                  Talk to an Expert
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable Components
interface FormSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  theme: 'light' | 'dark'
}

function FormSection({ title, icon, isExpanded, onToggle, children, theme }: FormSectionProps) {
  return (
    <div className="rounded-2xl backdrop-blur-md border overflow-hidden transition-all" style={{
      background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)',
      boxShadow: '0 10px 25px rgba(6, 182, 212, 0.08)'
    }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 transition-colors hover:bg-black/5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(6, 182, 212, 0.1))',
            color: '#16A34A'
          }}>
            {icon}
          </div>
          <h3 className="font-semibold text-lg" style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
            {title}
          </h3>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
  maxLength?: number
  theme: 'light' | 'dark'
}

function InputField({ label, value, onChange, error, required, type = 'text', placeholder, maxLength, theme }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}>
        {label} {required && <span style={{ color: '#F97316' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
        style={{
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: error
            ? '#F97316'
            : theme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(148, 163, 184, 0.2)',
          color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
          boxShadow: error ? '0 0 0 3px rgba(249, 115, 22, 0.1)' : 'none'
        }}
      />
      {error && (
        <p className="mt-1 text-xs" style={{ color: '#F97316' }}>
          {error}
        </p>
      )}
    </div>
  )
}
