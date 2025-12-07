import { Router } from 'express'
import * as historyController from '@/controllers/history.controller'
import { authenticate } from '@/middleware/auth.middleware'

const router = Router()

// All history routes require authentication
router.use(authenticate)

router.get('/:noteId/history', historyController.getNoteHistory)
router.get('/:noteId/history/:historyId', historyController.getHistoryEntry)
router.post('/:noteId/history/:historyId/restore', historyController.restoreFromHistory)
router.delete('/:noteId/history/:historyId', historyController.deleteHistoryEntry)

export default router
