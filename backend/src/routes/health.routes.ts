import { Router } from 'express'
import * as healthController from '@/controllers/health.controller'

const router = Router()

router.get('/health', healthController.healthCheck)
router.get('/ping', healthController.ping)
router.get('/version', healthController.getVersion)

export default router
