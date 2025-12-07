import { getRedisClient } from '@/config/redis.config'

export class CacheUtil {
    private redis = getRedisClient()

    async get<T>(key: string): Promise<T | null> {
        if (!this.redis) return null

        try {
            const data = await this.redis.get(key)
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.error('Cache get error:', error)
            return null
        }
    }

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        if (!this.redis) return

        try {
            const serialized = JSON.stringify(value)
            if (ttlSeconds) {
                await this.redis.setex(key, ttlSeconds, serialized)
            } else {
                await this.redis.set(key, serialized)
            }
        } catch (error) {
            console.error('Cache set error:', error)
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return

        try {
            await this.redis.del(key)
        } catch (error) {
            console.error('Cache delete error:', error)
        }
    }

    async delPattern(pattern: string): Promise<void> {
        if (!this.redis) return

        try {
            const keys = await this.redis.keys(pattern)
            if (keys.length > 0) {
                await this.redis.del(...keys)
            }
        } catch (error) {
            console.error('Cache delete pattern error:', error)
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.redis) return false

        try {
            const result = await this.redis.exists(key)
            return result === 1
        } catch (error) {
            console.error('Cache exists error:', error)
            return false
        }
    }
}

export const cacheUtil = new CacheUtil()
