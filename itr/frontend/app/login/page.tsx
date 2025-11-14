'use client'

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, FileText, CheckCircle, AlertCircle, Mail, Lock, LogIn, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const data = await authAPI.login({ email, password })

      if (data.success) {
        setSuccess(true)
        
        // Store auth data
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        
        // Smooth transition
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard'
          }
        }, 1000)
      } else {
        setError(data.error || data.message || 'Invalid email or password')
        setLoading(false)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Unable to connect to server. Please ensure the backend is running on port 2050.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`w-full max-w-md relative z-10 ${mounted ? 'animate-scaleIn' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Image
                  src="/tax-genie-mascot.png"
                  alt="Tax Genie"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Tax Genie</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Login to continue filing your ITR</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-start animate-fadeIn backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-green-300 text-sm font-medium">Login successful! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg flex items-start animate-fadeIn backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="animate-slideInLeft">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                    placeholder="you@example.com"
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div className="animate-slideInRight">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                    placeholder="••••••••"
                    disabled={loading || success}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="relative w-full group/btn"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75 group-hover/btn:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Success!
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Login to Dashboard
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
