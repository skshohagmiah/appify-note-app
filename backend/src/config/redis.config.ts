import Redis from 'ioredis'

let redis: Redis | null = null

export const getRedisClient = (): Redis | null => {
    if (redis) return redis

    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: null, // Required for BullMQ blocking operations
            retryStrategy: (times) => {
                if (times > 3) {
                    console.error('Redis connection failed after 3 retries')
                    return null
                }
                return Math.min(times * 100, 3000)
            },
        })

        redis.on('connect', () => {
            console.log('✅ Redis connected successfully')
        })

        redis.on('error', (err) => {
            console.warn('⚠️  Redis connection error:', err.message)
            console.warn('⚠️  Caching will be disabled')
        })

        return redis
    } catch (error) {
        console.warn('⚠️  Failed to initialize Redis:', error)
        console.warn('⚠️  Caching will be disabled')
        return null
    }
}

export const closeRedis = async () => {
    if (redis) {
        await redis.quit()
        redis = null
    }
}

export default getRedisClient
