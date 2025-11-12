'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Calculator, TrendingUp, Moon, Sun, LogOut, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useTheme } from '@/components/ThemeProvider'
import { taxAPI } from '@/lib/api'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        setUser(JSON.parse(userStr))
      }

      const returnsData = await taxAPI.getReturns()
      if (returnsData.success) {
        setReturns(returnsData.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const createNewReturn = async () => {
    try {
      const data = await taxAPI.createReturn({
        assessmentYear: '2025-26',
        financialYear: '2024-25',
        taxRegime: 'new'
      })
      if (data.success) {
        router.push(`/calculator?returnId=${data.data.returnId}`)
      }
    } catch (error) {
      console.error('Error creating return:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">ITR Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent transition"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.fullName || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your tax returns and file your ITR with ease
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Returns"
            value={returns.length.toString()}
            icon={<FileText className="h-8 w-8 text-blue-500" />}
            trend="+2 this year"
          />
          <StatCard
            title="Tax Saved"
            value="₹36,400"
            icon={<TrendingUp className="h-8 w-8 text-green-500" />}
            trend="vs old regime"
          />
          <StatCard
            title="Status"
            value="Up to date"
            icon={<Calculator className="h-8 w-8 text-purple-500" />}
            trend="All filed"
          />
          <StatCard
            title="Next Deadline"
            value="Jul 31, 2025"
            icon={<FileText className="h-8 w-8 text-orange-500" />}
            trend="ITR-1"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Calculate Tax"
            description="Compare old vs new regime and get recommendations"
            icon={<Calculator className="h-12 w-12 text-blue-500" />}
            onClick={() => router.push('/calculator')}
          />
          <ActionCard
            title="New Tax Return"
            description="Start filing your ITR for FY 2024-25"
            icon={<Plus className="h-12 w-12 text-green-500" />}
            onClick={createNewReturn}
          />
          <ActionCard
            title="Upload Form 16"
            description="Auto-fill your salary details from Form 16"
            icon={<FileText className="h-12 w-12 text-purple-500" />}
            onClick={() => router.push('/upload')}
          />
        </div>

        {/* Recent Returns */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Tax Returns</h2>
            <button
              onClick={createNewReturn}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              <Plus className="h-5 w-5" />
              <span>New Return</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : returns.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tax returns yet</h3>
              <p className="text-muted-foreground mb-6">Start by creating your first tax return</p>
              <button
                onClick={createNewReturn}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Create First Return
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((ret: any) => (
                <div
                  key={ret.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition cursor-pointer"
                  onClick={() => router.push(`/calculator?returnId=${ret.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {ret.assessment_year} ({ret.financial_year})
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {ret.itr_form_type} • {ret.tax_regime} regime • {ret.status}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-accent rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </div>
  )
}

function ActionCard({ title, description, icon, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition cursor-pointer group"
    >
      <div className="mb-4 transform group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
