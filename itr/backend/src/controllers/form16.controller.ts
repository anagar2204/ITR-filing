import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { parseForm16PDF } from '../services/form16-parser.service'
import { EventEmitter } from 'events'

// Store upload sessions and SSE clients
const uploadSessions = new Map<string, any>()
const sseClients = new Map<string, Response[]>()
const parseEmitter = new EventEmitter()

export const uploadForm16 = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadId = uuidv4()
    const fileData = files.map(file => ({
      fileId: uuidv4(),
      name: file.originalname,
      size: file.size,
      path: file.path,
      status: 'uploaded'
    }))

    // Store session
    uploadSessions.set(uploadId, {
      uploadId,
      files: fileData,
      createdAt: new Date()
    })

    // Start parsing asynchronously
    fileData.forEach(file => {
      parseForm16Async(uploadId, file)
    })

    res.json({
      uploadId,
      files: fileData.map(({ path, ...rest }) => rest)
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}

export const getUploadStatus = (req: Request, res: Response) => {
  const { uploadId } = req.params

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Add client to list
  if (!sseClients.has(uploadId)) {
    sseClients.set(uploadId, [])
  }
  sseClients.get(uploadId)!.push(res)

  // Send initial status
  const session = uploadSessions.get(uploadId)
  if (session) {
    session.files.forEach((file: any) => {
      res.write(`data: ${JSON.stringify({
        fileId: file.fileId,
        status: file.status,
        progress: file.progress || 0
      })}\n\n`)
    })
  }

  // Listen for updates
  const updateListener = (data: any) => {
    if (data.uploadId === uploadId) {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }
  parseEmitter.on('progress', updateListener)

  // Clean up on close
  req.on('close', () => {
    parseEmitter.off('progress', updateListener)
    const clients = sseClients.get(uploadId)
    if (clients) {
      const index = clients.indexOf(res)
      if (index > -1) clients.splice(index, 1)
    }
  })
}

export const applyParsedData = async (req: Request, res: Response) => {
  try {
    const { uploadId, fileId, targetFormId } = req.body

    const session = uploadSessions.get(uploadId)
    if (!session) {
      return res.status(404).json({ error: 'Upload session not found' })
    }

    const file = session.files.find((f: any) => f.fileId === fileId)
    if (!file || !file.parsedData) {
      return res.status(404).json({ error: 'Parsed data not found' })
    }

    // Here you would apply the parsed data to the user's form
    // For now, just return success
    const appliedFields = Object.keys(file.parsedData.parsed || {})

    res.json({
      success: true,
      appliedFields,
      warnings: file.parsedData.warnings || []
    })
  } catch (error) {
    console.error('Apply error:', error)
    res.status(500).json({ error: 'Failed to apply data' })
  }
}

// Async parsing function
async function parseForm16Async(uploadId: string, file: any) {
  try {
    // Emit parsing started
    emitProgress(uploadId, file.fileId, 'parsing', 10)

    // Parse the PDF
    const result = await parseForm16PDF(file.path, (progress) => {
      emitProgress(uploadId, file.fileId, 'parsing', progress)
    })

    // Update session
    const session = uploadSessions.get(uploadId)
    if (session) {
      const fileIndex = session.files.findIndex((f: any) => f.fileId === file.fileId)
      if (fileIndex > -1) {
        session.files[fileIndex] = {
          ...session.files[fileIndex],
          status: 'done',
          progress: 100,
          parsedData: result
        }
      }
    }

    // Emit completion
    emitProgress(uploadId, file.fileId, 'done', 100, result)
  } catch (error) {
    console.error('Parse error:', error)
    
    // Update session with error
    const session = uploadSessions.get(uploadId)
    if (session) {
      const fileIndex = session.files.findIndex((f: any) => f.fileId === file.fileId)
      if (fileIndex > -1) {
        session.files[fileIndex] = {
          ...session.files[fileIndex],
          status: 'failed',
          error: error instanceof Error ? error.message : 'Parsing failed'
        }
      }
    }

    emitProgress(uploadId, file.fileId, 'failed', 0, null, error instanceof Error ? error.message : 'Parsing failed')
  }
}

function emitProgress(uploadId: string, fileId: string, status: string, progress: number, result?: any, error?: string) {
  const data: any = {
    uploadId,
    fileId,
    status,
    progress
  }

  if (result) data.result = result
  if (error) data.error = error

  parseEmitter.emit('progress', data)
}
