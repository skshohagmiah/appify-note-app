import { z } from 'zod'

export const createNoteSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
        content: z.string().min(1, 'Content is required').max(100000, 'Content is too long'),
        workspaceId: z.string().cuid('Invalid workspace ID'),
        tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
        type: z.enum(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
        status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    }),
})

export const updateNoteSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long').optional(),
        content: z.string().min(1, 'Content is required').max(100000, 'Content is too long').optional(),
        tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
        type: z.enum(['PUBLIC', 'PRIVATE']).optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
})

export const noteQuerySchema = z.object({
    query: z.object({
        search: z.string().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'all']).optional(),
        type: z.enum(['PUBLIC', 'PRIVATE', 'all']).optional(),
        tags: z.string().optional(), // Comma-separated tags
        sortBy: z.enum(['newest', 'oldest', 'most_upvoted', 'most_downvoted']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>['body']
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>['body']
export type NoteQueryInput = z.infer<typeof noteQuerySchema>['query']
