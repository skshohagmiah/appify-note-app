import { Router } from 'express'
import * as voteController from '@/controllers/vote.controller'
import { authenticate, optionalAuthenticate } from '@/middleware/auth.middleware'
import { validateBody } from '@/middleware/validation.middleware'
import { voteSchema } from '@/validators/vote.validator'

const router = Router()

router.post('/:noteId/vote', authenticate, validateBody(voteSchema.shape.body), voteController.voteOnNote)

router.put('/:noteId/vote', authenticate, validateBody(voteSchema.shape.body), voteController.changeVote)

router.delete('/:noteId/vote', authenticate, voteController.removeVote)

router.get('/:noteId/votes', optionalAuthenticate, voteController.getVoteCounts)

export default router
