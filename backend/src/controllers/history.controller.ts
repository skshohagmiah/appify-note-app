import { Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendPaginatedSuccess } from '@/utils/response.util'
import { NotFoundError, ForbiddenError } from '@/utils/errors.util'
import { getPaginationParams, createPaginationMeta } from '@/utils/pagination.util'

export const getNoteHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId } = req.params
        const { page, limit } = req.query
        const { skip, take, page: pageNum, limit: limitNum } = getPaginationParams(
            String(page || ''),
            String(limit || ''),
        )

        // Check if note exists and user has access
        const note = await prisma.note.findUnique({
            where: { id: noteId },
            include: {
                workspace: true,
            },
        })

        if (!note) {
            throw new NotFoundError('Note not found')
        }

        if (note.workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this note')
        }

        const [histories, total] = await Promise.all([
            prisma.noteHistory.findMany({
                where: { noteId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.noteHistory.count({
                where: { noteId },
            }),
        ])

        const pagination = createPaginationMeta(pageNum, limitNum, total)
        sendPaginatedSuccess(res, histories, pagination)
    } catch (error) {
        next(error)
    }
}

export const getHistoryEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId, historyId } = req.params

        const history = await prisma.noteHistory.findUnique({
            where: { id: historyId },
            include: {
                note: {
                    include: {
                        workspace: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        })

        if (!history) {
            throw new NotFoundError('History entry not found')
        }

        if (history.noteId !== noteId) {
            throw new NotFoundError('History entry does not belong to this note')
        }

        if (history.note.workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this history entry')
        }

        sendSuccess(res, history)
    } catch (error) {
        next(error)
    }
}

export const restoreFromHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId, historyId } = req.params

        const history = await prisma.noteHistory.findUnique({
            where: { id: historyId },
            include: {
                note: {
                    include: {
                        workspace: true,
                    },
                },
            },
        })

        if (!history) {
            throw new NotFoundError('History entry not found')
        }

        if (history.noteId !== noteId) {
            throw new NotFoundError('History entry does not belong to this note')
        }

        if (history.note.workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this history entry')
        }

        // Create a new history entry for current state before restoring
        await prisma.noteHistory.create({
            data: {
                noteId: history.note.id,
                previousTitle: history.note.title,
                previousContent: history.note.content,
                updatedBy: req.user.userId,
            },
        })

        // Restore note from history
        const restoredNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                title: history.previousTitle,
                content: history.previousContent,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        })

        const [upvotes, downvotes, userVote] = await Promise.all([
            prisma.vote.count({
                where: { noteId: restoredNote.id, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId: restoredNote.id, type: 'DOWNVOTE' },
            }),
            prisma.vote.findUnique({
                where: {
                    noteId_userId: {
                        noteId: restoredNote.id,
                        userId: req.user.userId,
                    },
                },
            }),
        ])

        const noteResponse = {
            ...restoredNote,
            tags: restoredNote.tags.map((nt) => ({
                id: nt.tag.id,
                name: nt.tag.name,
                slug: nt.tag.slug,
                noteCount: 0,
            })),
            votes: {
                upvotes,
                downvotes,
                userVote: userVote ? (userVote.type === 'UPVOTE' ? 'upvote' : 'downvote') : null,
            },
        }

        sendSuccess(res, noteResponse, 'Note restored from history successfully')
    } catch (error) {
        next(error)
    }
}

export const deleteHistoryEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId, historyId } = req.params

        const history = await prisma.noteHistory.findUnique({
            where: { id: historyId },
            include: {
                note: {
                    include: {
                        workspace: true,
                    },
                },
            },
        })

        if (!history) {
            throw new NotFoundError('History entry not found')
        }

        if (history.noteId !== noteId) {
            throw new NotFoundError('History entry does not belong to this note')
        }

        if (history.note.workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this history entry')
        }

        await prisma.noteHistory.delete({
            where: { id: historyId },
        })

        sendSuccess(res, null, 'History entry deleted successfully')
    } catch (error) {
        next(error)
    }
}
