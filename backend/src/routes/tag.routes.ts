import { Router } from 'express'
import * as tagController from '@/controllers/tag.controller'
import { optionalAuthenticate } from '@/middleware/auth.middleware'
import { cache } from '@/middleware/cache.middleware'

const router = Router()

router.get(
    '/',
    cache({ ttl: Number(process.env.CACHE_TAG_LIST_TTL) || 3600, keyPrefix: 'tags' }),
    tagController.getAllTags,
)

router.get('/popular', tagController.getPopularTags)

router.get('/search', tagController.searchTags)

router.get('/:slug', tagController.getTag)

router.get('/:slug/notes', optionalAuthenticate, tagController.getNotesByTag)

export default router
