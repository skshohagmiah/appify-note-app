import { z } from 'zod'

export const createWorkspaceSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Workspace name must be at least 3 characters').max(100, 'Workspace name is too long'),
        description: z.string().max(500, 'Description is too long').optional(),
    }),
})

export const updateWorkspaceSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Workspace name must be at least 3 characters').max(100, 'Workspace name is too long').optional(),
        description: z.string().max(500, 'Description is too long').optional(),
    }),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>['body']
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>['body']
