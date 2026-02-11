import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Routes
import dishRoutes from './routes/dishes.js'
import galleryRoutes from './routes/gallery.js'
import dailyMenuRoutes from './routes/dailyMenu.js'
import orderRoutes from './routes/orders.js'
import authRoutes from './routes/auth.js'

// Configuración
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://elcasinobenilloba.com',
  'https://www.elcasinobenilloba.com',
  'https://el-casino.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como apps móviles o Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/dishes', dishRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/daily-menu', dailyMenuRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'El Casino API', 
    version: '1.0.0',
    status: 'running'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
})
