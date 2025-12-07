import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '@/utils/jwt.util'
import { AuthenticationError, ForbiddenError } from '@/utils/errors.util'

export interface AuthRequest<
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Record<string, unknown>
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: JwtPayload
}


export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided')
        }

        const token = authHeader.substring(7)
        const payload = verifyAccessToken(token)

        req.user = payload
        next()
    } catch (error) {
        if (error instanceof Error) {
            next(new AuthenticationError(error.message))
        } else {
            next(new AuthenticationError())
        }
    }
}

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const payload = verifyAccessToken(token)
            req.user = payload
        }

        next()
    } catch (error) {
        // Silently fail for optional auth
        next()
    }
}

export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AuthenticationError())
    }

    if (req.user.role !== 'OWNER') {
        return next(new ForbiddenError('Only company owners can perform this action'))
    }

    next()
}

export const requireMember = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AuthenticationError())
    }

    if (req.user.role !== 'OWNER' && req.user.role !== 'MEMBER') {
        return next(new ForbiddenError('Insufficient permissions'))
    }

    next()
}
