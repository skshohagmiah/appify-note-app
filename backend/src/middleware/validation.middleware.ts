import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '@/utils/errors.util'

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            })
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.reduce((acc, err) => {
                    const path = err.path.join('.')
                    acc[path] = err.message
                    return acc
                }, {} as Record<string, string>)

                next(new ValidationError('Validation failed', formattedErrors))
            } else {
                next(error)
            }
        }
    }
}

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.reduce((acc, err) => {
                    const path = err.path.join('.')
                    acc[path] = err.message
                    return acc
                }, {} as Record<string, string>)

                next(new ValidationError('Validation failed', formattedErrors))
            } else {
                next(error)
            }
        }
    }
}

export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.reduce((acc, err) => {
                    const path = err.path.join('.')
                    acc[path] = err.message
                    return acc
                }, {} as Record<string, string>)

                next(new ValidationError('Validation failed', formattedErrors))
            } else {
                next(error)
            }
        }
    }
}
