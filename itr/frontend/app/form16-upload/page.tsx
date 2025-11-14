'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useDropzone } from 'react-dropzone'
import FAQPanel from './components/FAQPanel'
import FileQueueRow from './components/FileQueueRow'

interface UploadedFile {
  fileId: string
  name: string
  size: number
  status: 'uploading' | 'parsing' | 'done' | 'failed'
  progress: number
  parsedData?: any
  confidence?: number
  error?: string
}

export default function Form16UploadPage() {
  const { theme } = useTheme()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validate files
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })

    if (validFiles.length === 0) return

    // Add files to queue
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      fileId: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Upload files
    await uploadFiles(validFiles, newFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  const uploadFiles = async (fileList: File[], fileData: UploadedFile[]) => {
    const formData = new FormData()
    fileList.forEach(file => formData.append('files', file))

    try {
      const response = await fetch('http://localhost:5000/api/form16/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setUploadId(data.uploadId)
        
        // Update file IDs from response
        setFiles(prev => prev.map((f, index) => ({
          ...f,
          fileId: data.files[index]?.fileId || f.fileId
        })))

        // Start polling for progress updates
        startProgressListener(data.uploadId, fileData)
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setFiles(prev => prev.map(f => ({ ...f, status: 'failed', error: 'Upload failed' })))
    }
  }

  const startProgressListener = (uploadId: string, fileData: UploadedFile[]) => {
    const pollProgress = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/form16/status/${uploadId}`)
        const data = await response.json()
        
        if (data.success) {
          const uploadData = data.data
          
          // Update file statuses
          setFiles(prev => prev.map(f => {
            const fileProgress = uploadData.files.find((fp: any) => fp.fileId === f.fileId)
            if (fileProgress) {
              return {
                ...f,
                status: fileProgress.status,
                progress: fileProgress.progress,
                parsedData: fileProgress.parsedData,
                confidence: fileProgress.confidence,
                error: fileProgress.error
              }
            }
            return f
          }))
          
          // Continue polling if not all files are done
          const allDone = uploadData.files.every((f: any) => f.status === 'done' || f.status === 'failed')
          if (!allDone) {
            setTimeout(pollProgress, 1000) // Poll every second
          }
        }
      } catch (error) {
        console.error('Failed to poll progress:', error)
      }
    }
    
    // Start polling
    setTimeout(pollProgress, 1000)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.fileId !== fileId))
  }

  const applyParsedData = async (fileId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/form16/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, fileId, userId: 'default-user' })
      })

      const data = await response.json()
      if (data.success) {
        alert('Form 16 data applied successfully! Redirecting to tax summary...')
        setTimeout(() => {
          window.location.href = '/tax-summary'
        }, 1500)
      } else {
        alert('Failed to apply data: ' + data.message)
      }
    } catch (error) {
      console.error('Apply failed:', error)
    }
  }

  const totalProgress = files.length > 0 
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length 
    : 0

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F3FAF7 0%, #ECF5FF 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 
            className="text-4xl font-semibold mb-3 text-center"
            style={{ 
              background: 'linear-gradient(90deg, #16A34A, #06B6D4, #2563EB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Upload Form-16 to Auto-Fill Your Data
          </h1>
          <p 
            className="text-center mb-12 text-lg"
            style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
          >
            Save time by automatically extracting salary and tax details from your Form-16
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Upload Card */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="rounded-2xl backdrop-blur-md border p-8"
              style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.06)',
                boxShadow: '0 12px 30px rgba(6, 182, 212, 0.06)'
              }}
            >
              {/* Info Strip */}
              <div
                className="mb-6 p-4 rounded-lg flex items-start gap-3"
                style={{
                  background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(22, 163, 74, 0.05)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 163, 74, 0.1)'}`
                }}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                <div className="text-sm" style={{ color: theme === 'dark' ? '#D1D5DB' : '#0F172A' }}>
                  <strong>Tip:</strong> You can upload multiple Form-16s if you switched jobs this financial year. We'll merge the data automatically.
                </div>
              </div>

              {/* Drop Zone */}
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300"
                style={{
                  borderColor: isDragActive || isDragging 
                    ? '#16A34A'
                    : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.3)',
                  background: isDragActive || isDragging
                    ? theme === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(22, 163, 74, 0.02)'
                    : 'transparent',
                  boxShadow: isDragActive || isDragging ? '0 0 0 4px rgba(22, 163, 74, 0.1)' : 'none'
                }}
              >
                <input {...getInputProps()} />
                <Upload 
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}
                />
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
                >
                  {isDragActive ? 'Drop files here' : 'Drag & drop your Form-16'}
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#94A3B8' : '#475569' }}
                >
                  or click to browse files
                </p>
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  style={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  Browse Files
                </button>
                <p 
                  className="text-xs mt-4"
                  style={{ color: theme === 'dark' ? '#64748B' : '#94A3B8' }}
                >
                  Supports PDF, PNG, JPG • Max 10MB per file
                </p>
              </div>

              {/* Progress Bar */}
              {files.length > 0 && totalProgress < 100 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#475569' }}>
                      Overall Progress
                    </span>
                    <span style={{ color: theme === 'dark' ? '#10B981' : '#16A34A' }}>
                      {Math.round(totalProgress)}%
                    </span>
                  </div>
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.2)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(90deg, #16A34A, #06B6D4)',
                        width: `${totalProgress}%`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* File Queue */}
              <AnimatePresence>
                {files.map(file => (
                  <FileQueueRow
                    key={file.fileId}
                    file={file}
                    onRemove={removeFile}
                    onApply={applyParsedData}
                    theme={theme}
                  />
                ))}
              </AnimatePresence>

              {/* Continue without Form-16 */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 163, 74, 0.2)'}`,
                    color: theme === 'dark' ? '#10B981' : '#16A34A'
                  }}
                >
                  Continue without Form-16
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: FAQ Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <FAQPanel theme={theme} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
