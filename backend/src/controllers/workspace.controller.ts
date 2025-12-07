import { Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendPaginatedSuccess } from '@/utils/response.util'
import { NotFoundError, ForbiddenError } from '@/utils/errors.util'
import { generateUniqueWorkspaceSlug } from '@/utils/slug.util'
import { getPaginationParams, createPaginationMeta } from '@/utils/pagination.util'
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '@/validators/workspace.validator'

export const getAllWorkspaces = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { skip, take, page, limit } = getPaginationParams(
            String(req.query.page || ''),
            String(req.query.limit || ''),
        )

        const [workspaces, total] = await Promise.all([
            prisma.workspace.findMany({
                where: {
                    companyId: req.user.companyId,
                },
                skip,
                take,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    _count: {
                        select: {
                            notes: true,
                        },
                    },
                },
            }),
            prisma.workspace.count({
                where: {
                    companyId: req.user.companyId,
                },
            }),
        ])

        const pagination = createPaginationMeta(page, limit, total)
        sendPaginatedSuccess(res, workspaces, pagination)
    } catch (error) {
        next(error)
    }
}

export const createWorkspace = async (
    req: AuthRequest<object, object, CreateWorkspaceInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { name, description } = req.body

        // Generate unique slug
        const slug = await generateUniqueWorkspaceSlug(name, req.user.companyId)

        const workspace = await prisma.workspace.create({
            data: {
                name,
                slug,
                description,
                companyId: req.user.companyId,
            },
        })

        sendSuccess(res, workspace, 'Workspace created successfully', 201)
    } catch (error) {
        next(error)
    }
}

export const getWorkspace = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params

        const workspace = await prisma.workspace.findUnique({
            where: { id },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        // Check if workspace belongs to user's company
        if (workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this workspace')
        }

        sendSuccess(res, workspace)
    } catch (error) {
        next(error)
    }
}

export const updateWorkspace = async (
    req: AuthRequest<{ id: string }, object, UpdateWorkspaceInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params
        const { name, description } = req.body

        const workspace = await prisma.workspace.findUnique({
            where: { id },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this workspace')
        }

        const updateData: { name?: string; slug?: string; description?: string } = {}

        if (name) {
            updateData.name = name
            updateData.slug = await generateUniqueWorkspaceSlug(name, req.user.companyId)
        }

        if (description !== undefined) {
            updateData.description = description
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: { id },
            data: updateData,
        })

        sendSuccess(res, updatedWorkspace, 'Workspace updated successfully')
    } catch (error) {
        next(error)
    }
}

export const deleteWorkspace = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params

        const workspace = await prisma.workspace.findUnique({
            where: { id },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this workspace')
        }

        await prisma.workspace.delete({
            where: { id },
        })

        sendSuccess(res, null, 'Workspace deleted successfully')
    } catch (error) {
        next(error)
    }
}

export const getWorkspaceStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params

        const workspace = await prisma.workspace.findUnique({
            where: { id },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this workspace')
        }

        const [totalNotes, publishedNotes, draftNotes, totalVotes] = await Promise.all([
            prisma.note.count({
                where: { workspaceId: id },
            }),
            prisma.note.count({
                where: { workspaceId: id, status: 'PUBLISHED' },
            }),
            prisma.note.count({
                where: { workspaceId: id, status: 'DRAFT' },
            }),
            prisma.vote.count({
                where: {
                    note: {
                        workspaceId: id,
                    },
                },
            }),
        ])

        sendSuccess(res, {
            totalNotes,
            publishedNotes,
            draftNotes,
            totalVotes,
        })
    } catch (error) {
        next(error)
    }
}
