import { Request, Response, NextFunction } from 'express'
import { AppError, ValidationError } from '@/utils/errors.util'

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        const response: {
            success: boolean
            message: string
            error: string
            statusCode: number
            details?: Record<string, unknown>
            stack?: string
        } = {
            success: false,
            message: err.message,
            error: err.message,
            statusCode: err.statusCode,
        }

        if (err instanceof ValidationError && err.details) {
            response.details = err.details
        }

        if (process.env.NODE_ENV === 'development') {
            response.stack = err.stack
        }

        return res.status(err.statusCode).json(response)
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as unknown as { code: string; meta?: { target?: string[] } }

        if (prismaError.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Resource already exists',
                error: 'Duplicate entry',
                statusCode: 409,
            })
        }

        if (prismaError.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
                error: 'Not found',
                statusCode: 404,
            })
        }
    }

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: 'Validation error',
            statusCode: 400,
            details: (err as unknown as { issues: unknown[] }).issues,
        })
    }

    // Unknown errors
    console.error('Unexpected error:', err)

    const response: {
        success: boolean
        message: string
        error: string
        statusCode: number
        stack?: string
    } = {
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        error: 'Internal server error',
        statusCode: 500,
    }

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack
    }

    return res.status(500).json(response)
}

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        error: 'Not found',
        statusCode: 404,
    })
}
