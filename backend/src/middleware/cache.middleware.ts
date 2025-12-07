import { Request, Response, NextFunction } from 'express'
import { cacheUtil } from '@/utils/cache.util'

export interface CacheOptions {
    ttl: number // Time to live in seconds
    keyPrefix?: string
}

export const cache = (options: CacheOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next()
        }

        const key = generateCacheKey(req, options.keyPrefix)

        try {
            const cachedData = await cacheUtil.get(key)

            if (cachedData) {
                return res.json(cachedData)
            }

            // Store original json method
            const originalJson = res.json.bind(res)

            // Override json method to cache the response
            res.json = function (data: unknown) {
                // Cache the response
                cacheUtil.set(key, data, options.ttl).catch((err) => {
                    console.error('Failed to cache response:', err)
                })

                // Call original json method
                return originalJson(data)
            }

            next()
        } catch (error) {
            console.error('Cache middleware error:', error)
            next()
        }
    }
}

const generateCacheKey = (req: Request, prefix?: string): string => {
    const baseKey = prefix || 'cache'
    const url = req.originalUrl || req.url
    const userId = (req as { user?: { userId: string } }).user?.userId || 'anonymous'

    return `${baseKey}:${userId}:${url}`
}

export const invalidateCache = async (pattern: string) => {
    try {
        await cacheUtil.delPattern(pattern)
    } catch (error) {
        console.error('Failed to invalidate cache:', error)
    }
}
