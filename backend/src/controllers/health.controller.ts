import { Request, Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { sendSuccess } from '@/utils/response.util'

export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`

        sendSuccess(res, {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            redis: 'optional',
        })
    } catch (error) {
        next(error)
    }
}

export const ping = async (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString(),
    })
}

export const getVersion = async (req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            version: '1.0.0',
            apiVersion: 'v1',
            environment: process.env.NODE_ENV || 'development',
        },
    })
}
