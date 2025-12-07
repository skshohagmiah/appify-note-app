import { Response } from 'express'
import { PaginationMeta } from './pagination.util'

export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
    details?: Record<string, unknown>
    statusCode?: number
}

export interface PaginatedApiResponse<T> {
    success: boolean
    data: T[]
    pagination: PaginationMeta
    message?: string
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
) => {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
        statusCode,
    }
    return res.status(statusCode).json(response)
}

export const sendPaginatedSuccess = <T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message?: string,
    statusCode: number = 200,
) => {
    const response: PaginatedApiResponse<T> = {
        success: true,
        data,
        pagination,
        message,
    }
    return res.status(statusCode).json(response)
}

export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>,
) => {
    const response: ApiResponse<never> = {
        success: false,
        message,
        error: message,
        details,
        statusCode,
    }
    return res.status(statusCode).json(response)
}
