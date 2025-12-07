import { Router } from 'express'
import * as authController from '@/controllers/auth.controller'
import { authenticate } from '@/middleware/auth.middleware'
import { validateBody } from '@/middleware/validation.middleware'
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '@/validators/auth.validator'

const router = Router()

router.post('/register', validateBody(registerSchema.shape.body), authController.register)
router.post('/login', validateBody(loginSchema.shape.body), authController.login)
router.get('/me', authenticate, authController.getCurrentUser)
router.post('/logout', authenticate, authController.logout)
router.post('/refresh', validateBody(refreshTokenSchema.shape.body), authController.refreshAccessToken)
router.post('/forgot-password', validateBody(forgotPasswordSchema.shape.body), authController.forgotPassword)
router.post('/reset-password', validateBody(resetPasswordSchema.shape.body), authController.resetPassword)

export default router
