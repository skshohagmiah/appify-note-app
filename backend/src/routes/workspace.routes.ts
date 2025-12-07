import { Router } from 'express'
import * as workspaceController from '@/controllers/workspace.controller'
import { authenticate } from '@/middleware/auth.middleware'
import { validateBody } from '@/middleware/validation.middleware'
import { createWorkspaceSchema, updateWorkspaceSchema } from '@/validators/workspace.validator'

const router = Router()

// All workspace routes require authentication
router.use(authenticate)

router.get('/', workspaceController.getAllWorkspaces)
router.post('/', validateBody(createWorkspaceSchema.shape.body), workspaceController.createWorkspace)
router.get('/:id', workspaceController.getWorkspace)
router.put('/:id', validateBody(updateWorkspaceSchema.shape.body), workspaceController.updateWorkspace)
router.delete('/:id', workspaceController.deleteWorkspace)
router.get('/:id/stats', workspaceController.getWorkspaceStats)

export default router
