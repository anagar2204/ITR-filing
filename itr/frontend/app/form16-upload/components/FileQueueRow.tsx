'use client'

import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'

interface FileQueueRowProps {
  file: {
    fileId: string
    name: string
    size: number
    status: 'uploading' | 'parsing' | 'done' | 'failed'
    progress: number
    parsedData?: any
    confidence?: number
    error?: string
  }
  onRemove: (fileId: string) => void
  onApply: (fileId: string) => void
  theme: 'light' | 'dark'
}

export default function FileQueueRow({ file, onRemove, onApply, theme }: FileQueueRowProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusColor = () => {
    switch (file.status) {
      case 'done': return '#16A34A'
      case 'failed': return '#DC2626'
      case 'uploading':
      case 'parsing': return '#06B6D4'
      default: return '#94A3B8'
    }
  }

  const getStatusIcon = () => {
    switch (file.status) {
      case 'done': return <CheckCircle className="h-5 w-5" style={{ color: '#16A34A' }} />
      case 'failed': return <AlertCircle className="h-5 w-5" style={{ color: '#DC2626' }} />
      case 'uploading':
      case 'parsing': return <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#06B6D4' }} />
      default: return <FileText className="h-5 w-5" style={{ color: '#94A3B8' }} />
    }
  }

  const getStatusText = () => {
    switch (file.status) {
      case 'uploading': return 'Uploading...'
      case 'parsing': return `Parsing... ${file.progress}%`
      case 'done': return file.confidence ? `Done (${Math.round(file.confidence * 100)}% confidence)` : 'Done'
      case 'failed': return file.error || 'Failed'
      default: return 'Pending'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 p-4 rounded-lg border"
      style={{
        background: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(255, 255, 255, 0.6)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(148, 163, 184, 0.2)'
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 
              className="font-medium truncate"
              style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
            >
              {file.name}
            </h4>
            <button
              onClick={() => onRemove(file.fileId)}
              className="flex-shrink-0 ml-2 p-1 rounded hover:bg-black/10 transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm mb-2">
            <span style={{ color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
              {formatFileSize(file.size)}
            </span>
            <span 
              className="font-medium"
              style={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </span>
          </div>

          {/* Progress Bar */}
          {(file.status === 'uploading' || file.status === 'parsing') && (
            <div 
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.2)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                  width: `${file.progress}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${file.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Confidence Warning */}
          {file.status === 'done' && file.confidence && file.confidence < 0.7 && (
            <div 
              className="mt-2 p-2 rounded text-xs flex items-start gap-2"
              style={{
                background: 'rgba(251, 146, 60, 0.1)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
                color: '#F97316'
              }}
            >
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>Low confidence. Please review the extracted data carefully.</span>
            </div>
          )}

          {/* Apply Button */}
          {file.status === 'done' && file.parsedData && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onApply(file.fileId)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                }}
              >
                Apply to Form
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                  color: theme === 'dark' ? '#D1D5DB' : '#475569'
                }}
              >
                Preview Data
              </button>
            </div>
          )}

          {/* Error Message */}
          {file.status === 'failed' && file.error && (
            <div 
              className="mt-2 p-2 rounded text-xs"
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                color: '#DC2626'
              }}
            >
              {file.error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
