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

// Trust proxy is required when running behind a proxy (e.g. Nginx, Docker)
// to correctly identify the client IP address for rate limiting.
app.set('trust proxy', 1)

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
