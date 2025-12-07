import { Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess } from '@/utils/response.util'
import { NotFoundError, ForbiddenError, ConflictError } from '@/utils/errors.util'
import { VoteInput } from '@/validators/vote.validator'

export const voteOnNote = async (
    req: AuthRequest<{ noteId: string }, object, VoteInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId } = req.params
        const { type } = req.body

        // Check if note exists and is public
        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })

        if (!note) {
            throw new NotFoundError('Note not found')
        }

        if (note.type !== 'PUBLIC' || note.status !== 'PUBLISHED') {
            throw new ForbiddenError('Can only vote on public published notes')
        }

        // Check if user already voted
        const existingVote = await prisma.vote.findUnique({
            where: {
                noteId_userId: {
                    noteId,
                    userId: req.user.userId,
                },
            },
        })

        if (existingVote) {
            throw new ConflictError('You have already voted on this note. Use PUT to change your vote.')
        }

        // Create vote and update note counts transactionally
        await prisma.$transaction([
            prisma.vote.create({
                data: {
                    noteId,
                    userId: req.user.userId,
                    type: type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE',
                },
            }),
            prisma.note.update({
                where: { id: noteId },
                data: {
                    upvotes: type === 'upvote' ? { increment: 1 } : undefined,
                    downvotes: type === 'downvote' ? { increment: 1 } : undefined,
                },
            }),
        ])

        // Get updated vote counts (from the denormalized fields for consistency, or query)
        // Since we just updated, we can return the incremented values if we knew them, 
        // but for safety we can query or let the client refresh. 
        // To keep response interface same, let's query the counts.
        const [upvotes, downvotes] = await Promise.all([
            prisma.vote.count({
                where: { noteId, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId, type: 'DOWNVOTE' },
            }),
        ])

        sendSuccess(res, {
            success: true,
            userVote: type,
            upvotes,
            downvotes,
        })
    } catch (error) {
        next(error)
    }
}

export const changeVote = async (
    req: AuthRequest<{ noteId: string }, object, VoteInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId } = req.params
        const { type } = req.body

        const existingVote = await prisma.vote.findUnique({
            where: {
                noteId_userId: {
                    noteId,
                    userId: req.user.userId,
                },
            },
        })

        if (!existingVote) {
            throw new NotFoundError('You have not voted on this note yet. Use POST to create a vote.')
        }

        // Update vote and note counts transactionally
        await prisma.$transaction([
            prisma.vote.update({
                where: {
                    noteId_userId: {
                        noteId,
                        userId: req.user.userId,
                    },
                },
                data: {
                    type: type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE',
                },
            }),
            prisma.note.update({
                where: { id: noteId },
                data: {
                    upvotes: type === 'upvote' ? { increment: 1 } : { decrement: 1 },
                    downvotes: type === 'downvote' ? { increment: 1 } : { decrement: 1 },
                },
            }),
        ])

        // Get updated vote counts
        const [upvotes, downvotes] = await Promise.all([
            prisma.vote.count({
                where: { noteId, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId, type: 'DOWNVOTE' },
            }),
        ])

        sendSuccess(res, {
            success: true,
            userVote: type,
            upvotes,
            downvotes,
        })
    } catch (error) {
        next(error)
    }
}

export const removeVote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { noteId } = req.params

        const existingVote = await prisma.vote.findUnique({
            where: {
                noteId_userId: {
                    noteId,
                    userId: req.user.userId,
                },
            },
        })

        if (!existingVote) {
            throw new NotFoundError('You have not voted on this note')
        }

        await prisma.$transaction([
            prisma.vote.delete({
                where: {
                    noteId_userId: {
                        noteId,
                        userId: req.user.userId,
                    },
                },
            }),
            prisma.note.update({
                where: { id: noteId },
                data: {
                    upvotes: existingVote.type === 'UPVOTE' ? { decrement: 1 } : undefined,
                    downvotes: existingVote.type === 'DOWNVOTE' ? { decrement: 1 } : undefined,
                },
            }),
        ])

        // Get updated vote counts
        const [upvotes, downvotes] = await Promise.all([
            prisma.vote.count({
                where: { noteId, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId, type: 'DOWNVOTE' },
            }),
        ])

        sendSuccess(res, {
            success: true,
            userVote: null,
            upvotes,
            downvotes,
        })
    } catch (error) {
        next(error)
    }
}

export const getVoteCounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { noteId } = req.params

        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })

        if (!note) {
            throw new NotFoundError('Note not found')
        }

        const [upvotes, downvotes, userVote] = await Promise.all([
            prisma.vote.count({
                where: { noteId, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId, type: 'DOWNVOTE' },
            }),
            req.user
                ? prisma.vote.findUnique({
                    where: {
                        noteId_userId: {
                            noteId,
                            userId: req.user.userId,
                        },
                    },
                })
                : null,
        ])

        sendSuccess(res, {
            upvotes,
            downvotes,
            userVote: userVote ? (userVote.type === 'UPVOTE' ? 'upvote' : 'downvote') : null,
        })
    } catch (error) {
        next(error)
    }
}
