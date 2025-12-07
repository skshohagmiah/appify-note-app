import { Router } from 'express'
import authRoutes from './auth.routes'
import workspaceRoutes from './workspace.routes'
import noteRoutes from './note.routes'
import voteRoutes from './vote.routes'
import historyRoutes from './history.routes'
import tagRoutes from './tag.routes'
import healthRoutes from './health.routes'

const router = Router()

// API v1 routes
router.use('/auth', authRoutes)
router.use('/workspaces', workspaceRoutes)
router.use('/notes', noteRoutes)
router.use('/notes', voteRoutes) // Vote routes are nested under notes
router.use('/notes', historyRoutes) // History routes are nested under notes
router.use('/tags', tagRoutes)

// Health routes (not versioned)
router.use('/', healthRoutes)

export default router
