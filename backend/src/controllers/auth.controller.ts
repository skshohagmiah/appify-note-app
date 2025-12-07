import { Request, Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { hashPassword, comparePassword } from '@/utils/password.util'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt.util'
import { sendSuccess, sendError } from '@/utils/response.util'
import {
    AuthenticationError,
    ConflictError,
    NotFoundError,
    ValidationError,
} from '@/utils/errors.util'
import { AuthRequest } from '@/middleware/auth.middleware'
import { RegisterInput, LoginInput, RefreshTokenInput } from '@/validators/auth.validator'

export const register = async (
    req: Request<object, object, RegisterInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email, password, firstName, lastName, companyName } = req.body

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            throw new ConflictError('User with this email already exists')
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create company and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create company
            const company = await tx.company.create({
                data: {
                    name: companyName,
                },
            })

            // Create user as owner
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: 'OWNER',
                    companyId: company.id,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    companyId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })

            return { user, company }
        })

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: result.user.id,
            email: result.user.email,
            companyId: result.user.companyId,
            role: result.user.role,
        })

        const refreshToken = generateRefreshToken({
            userId: result.user.id,
            email: result.user.email,
            companyId: result.user.companyId,
            role: result.user.role,
        })

        sendSuccess(
            res,
            {
                token: accessToken,
                refreshToken,
                user: result.user,
            },
            'Registration successful',
            201,
        )
    } catch (error) {
        next(error)
    }
}

export const login = async (
    req: Request<object, object, LoginInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email, password } = req.body

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new AuthenticationError('Invalid email or password')
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid email or password')
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            companyId: user.companyId,
            role: user.role,
        })

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            companyId: user.companyId,
            role: user.role,
        })

        sendSuccess(res, {
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                companyId: user.companyId,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        })
    } catch (error) {
        next(error)
    }
}

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AuthenticationError()
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!user) {
            throw new NotFoundError('User not found')
        }

        sendSuccess(res, user)
    } catch (error) {
        next(error)
    }
}

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // In a production app, you might want to blacklist the token here
        // For now, we'll just send a success response
        sendSuccess(res, null, 'Logout successful')
    } catch (error) {
        next(error)
    }
}

export const refreshAccessToken = async (
    req: Request<object, object, RefreshTokenInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { refreshToken } = req.body

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken)

        // Generate new access token
        const newAccessToken = generateAccessToken({
            userId: payload.userId,
            email: payload.email,
            companyId: payload.companyId,
            role: payload.role,
        })

        sendSuccess(res, {
            token: newAccessToken,
        })
    } catch (error) {
        next(new AuthenticationError('Invalid or expired refresh token'))
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Don't reveal if user exists or not for security
            sendSuccess(res, null, 'If the email exists, a password reset link has been sent')
            return
        }

        // TODO: Generate reset token and send email
        // For now, just send success response
        // In production, you would:
        // 1. Generate a secure reset token
        // 2. Store it in database with expiration
        // 3. Send email with reset link

        sendSuccess(res, null, 'If the email exists, a password reset link has been sent')
    } catch (error) {
        next(error)
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const { token, password } = req.body

        // TODO: Verify reset token from database
        // For now, just throw an error
        // In production, you would:
        // 1. Verify token exists and not expired
        // 2. Hash new password
        // 3. Update user password
        // 4. Delete reset token

        throw new ValidationError('Password reset functionality not yet implemented')
    } catch (error) {
        next(error)
    }
}
