import app from './app'
import prisma from '@/config/database.config'
import { getRedisClient, closeRedis } from '@/config/redis.config'
import { initializeJobs } from '@/jobs'

const PORT = process.env.PORT || 3001

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect()
        console.log('✅ Database connected successfully')

        // Initialize Redis (optional)
        const redis = getRedisClient()
        if (redis) {
            console.log('✅ Redis initialized')
        } else {
            console.warn('⚠️  Redis not available - caching and background jobs disabled')
        }

        // Initialize background jobs
        if (redis) {
            await initializeJobs()
            console.log('✅ Background jobs initialized')
        }

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
            console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`)
        })

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`)

            server.close(async () => {
                console.log('HTTP server closed')

                // Close database connection
                await prisma.$disconnect()
                console.log('Database connection closed')

                // Close Redis connection
                await closeRedis()
                console.log('Redis connection closed')

                process.exit(0)
            })

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout')
                process.exit(1)
            }, 10000)
        }

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
        process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
