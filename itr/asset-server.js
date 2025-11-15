/**
 * Tax Genie Asset Server
 * Serves mascot assets and provides health endpoint
 */

const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp').default || require('sharp')

// Mascot configuration with correct path
const mascotConfig = {
  USER_MASCOT_PATH: "C:\\Users\\avani_t8fxv4m\\Desktop\\ITR filing\\mascot.png",
  ASSETS: { 
    SERVE_PATH: '/assets/mascot/mascot-full.png', 
    HEADER_BADGE: { width: 32, height: 32 } 
  },
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
  RESPONSIVE: {
    desktop: { maxWidth: 280 },
    tablet: { maxWidth: 200 },
    mobile: { maxWidth: 140 },
    small: { maxWidth: 120 }
  },
  PERFORMANCE: { 
    preload: true,
    lazyLoad: true,
    reduceMotion: true,
    fallbackIcon: '🧞‍♂️' 
  }
}

const app = express()
const PORT = process.env.ASSET_SERVER_PORT || 5001

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}))

// Middleware for logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mascot: {
      configured: !!mascotConfig.USER_MASCOT_PATH,
      exists: fs.existsSync(mascotConfig.USER_MASCOT_PATH),
      path: mascotConfig.ASSETS.SERVE_PATH
    }
  })
})

// Serve the main mascot asset
app.get('/assets/mascot/mascot-full.png', async (req, res) => {
  try {
    const mascotPath = mascotConfig.USER_MASCOT_PATH
    
    if (!fs.existsSync(mascotPath)) {
      console.error(`Mascot file not found: ${mascotPath}`)
      return res.status(404).json({ error: 'Mascot asset not found' })
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 year cache
    
    // Stream the file
    const fileStream = fs.createReadStream(mascotPath)
    fileStream.pipe(res)
    
  } catch (error) {
    console.error('Error serving mascot:', error)
    res.status(500).json({ error: 'Failed to serve mascot asset' })
  }
})

// Generate and serve header badge (optional - only if Sharp is available)
app.get('/assets/mascot/header-badge.png', async (req, res) => {
  try {
    const mascotPath = mascotConfig.USER_MASCOT_PATH
    
    if (!fs.existsSync(mascotPath)) {
      return res.status(404).json({ error: 'Source mascot not found' })
    }

    const { width, height } = mascotConfig.ASSETS.HEADER_BADGE
    
    // Try to generate resized badge using Sharp
    try {
      const resizedBuffer = await sharp(mascotPath)
        .resize(width, height, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer()

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=31536000')
      res.send(resizedBuffer)
      
    } catch (sharpError) {
      console.warn('Sharp not available, serving original mascot:', sharpError.message)
      // Fallback to original file
      const fileStream = fs.createReadStream(mascotPath)
      res.setHeader('Content-Type', 'image/png')
      fileStream.pipe(res)
    }
    
  } catch (error) {
    console.error('Error generating header badge:', error)
    res.status(500).json({ error: 'Failed to generate header badge' })
  }
})

// Serve mascot config as JSON for frontend
app.get('/api/mascot-config', (req, res) => {
  // Only send safe config data to frontend
  const frontendConfig = {
    ASSETS: mascotConfig.ASSETS,
    ANIMATIONS: mascotConfig.ANIMATIONS,
    RESPONSIVE: mascotConfig.RESPONSIVE,
    PERFORMANCE: mascotConfig.PERFORMANCE
  }
  
  res.json(frontendConfig)
})

// Static file serving for other assets
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'public', 'assets')))

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    message: mascotConfig.DEV.showErrors ? error.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Asset not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🧞‍♂️ Tax Genie Asset Server running on http://localhost:${PORT}`)
  console.log(`📁 Serving mascot from: ${mascotConfig?.USER_MASCOT_PATH || 'Not configured'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  
  if (mascotConfig?.ASSETS?.SERVE_PATH) {
    console.log(`🎭 Mascot URL: http://localhost:${PORT}${mascotConfig.ASSETS.SERVE_PATH}`)
  } else {
    console.warn(`⚠️  Warning: Mascot config not loaded properly`)
    console.log(`   Config object:`, mascotConfig)
  }
  
  // Verify mascot file exists
  if (mascotConfig?.USER_MASCOT_PATH && !fs.existsSync(mascotConfig.USER_MASCOT_PATH)) {
    console.warn(`⚠️  Warning: Mascot file not found at ${mascotConfig.USER_MASCOT_PATH}`)
    console.warn(`   Please update mascot.config.js with the correct path`)
  }
})

module.exports = app
