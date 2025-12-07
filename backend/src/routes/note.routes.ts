import { Router } from 'express'
import * as noteController from '@/controllers/note.controller'
import { authenticate, optionalAuthenticate } from '@/middleware/auth.middleware'
import { validateBody, validateQuery } from '@/middleware/validation.middleware'
import { createNoteSchema, updateNoteSchema, noteQuerySchema } from '@/validators/note.validator'
import { cache } from '@/middleware/cache.middleware'

const router = Router()

// Public routes (no auth required)
router.get(
    '/public',
    optionalAuthenticate,
    validateQuery(noteQuerySchema.shape.query),
    cache({ ttl: Number(process.env.CACHE_PUBLIC_NOTES_TTL) || 300, keyPrefix: 'public-notes' }),
    noteController.getPublicNotes,
)

router.get(
    '/search',
    optionalAuthenticate,
    validateQuery(noteQuerySchema.shape.query),
    noteController.searchNotes,
)

// Protected routes
router.get('/my-notes', authenticate, noteController.getMyNotes)

router.get(
    '/workspace/:workspaceId',
    authenticate,
    validateQuery(noteQuerySchema.shape.query),
    noteController.getWorkspaceNotes,
)

router.get('/:id', optionalAuthenticate, noteController.getNote)

router.post('/', authenticate, validateBody(createNoteSchema.shape.body), noteController.createNote)

router.put('/:id', authenticate, validateBody(updateNoteSchema.shape.body), noteController.updateNote)

router.delete('/:id', authenticate, noteController.deleteNote)

router.patch('/:id/publish', authenticate, noteController.publishNote)

router.patch('/:id/unpublish', authenticate, noteController.unpublishNote)

export default router
