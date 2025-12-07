import express, { Express } from 'express'
import compression from 'compression'
import dotenv from 'dotenv'
import { setupSecurity } from '@/middleware/security.middleware'
import { getLogger } from '@/middleware/logger.middleware'
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware'
import routes from '@/routes'

// Load environment variables
dotenv.config()

const app: Express = express()

// Security middleware
setupSecurity(app)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(getLogger())

// API routes
app.use('/api/v1', routes)

// 404 handler
app.use(notFoundHandler)

// Error handler (must be last)
app.use(errorHandler)

export default app
