import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { Express } from 'express'

export const setupSecurity = (app: Express) => {
    // Helmet for security headers
    app.use(helmet())

    // CORS configuration
    const corsOptions = {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        optionsSuccessStatus: 200,
    }
    app.use(cors(corsOptions))

    // Rate limiting
    const limiter = rateLimit({
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 15 minutes
        max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // Increased for extensive testing
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later',
            error: 'Rate limit exceeded',
            statusCode: 429,
        },
        standardHeaders: true,
        legacyHeaders: false,
    })

    app.use('/api/', limiter)

    // Strict rate limiting for auth endpoints
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: {
            success: false,
            message: 'Too many authentication attempts, please try again later',
            error: 'Rate limit exceeded',
            statusCode: 429,
        },
    })

    app.use('/api/v1/auth/login', authLimiter)
    app.use('/api/v1/auth/register', authLimiter)
}
