import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { config } from './config/env.js'
import apiRoutes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'

const app = express()

// Trust proxy for Render / reverse proxies (essential for HTTPS cookies & rate limiter)
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// CORS configuration supporting credentials (cookies, auth headers)
const clientUrlClean = config.clientUrl?.replace(/\/$/, '')
const allowedOrigins = [
  clientUrlClean,
  'https://lector-pdf-online.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, true) // Fallback during dev / preflight
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

// Body parsers
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Cookie parser for HttpOnly refresh tokens
app.use(cookieParser())

// Mount API routes
app.use('/api', apiRoutes)

// 404 handler for undefined routes
app.use(notFoundHandler)

// Central error handler
app.use(errorHandler)

export default app
