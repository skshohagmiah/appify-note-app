import { Request, Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { sendSuccess, sendPaginatedSuccess } from '@/utils/response.util'
import { NotFoundError } from '@/utils/errors.util'
import { getPaginationParams, createPaginationMeta } from '@/utils/pagination.util'
import { AuthRequest } from '@/middleware/auth.middleware'

export const getAllTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        notes: true,
                    },
                },
            },
        })

        const tagsWithCount = tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            noteCount: tag._count.notes,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
        }))

        sendSuccess(res, tagsWithCount)
    } catch (error) {
        next(error)
    }
}

export const getTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params

        const tag = await prisma.tag.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        notes: true,
                    },
                },
            },
        })

        if (!tag) {
            throw new NotFoundError('Tag not found')
        }

        const tagWithCount = {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            noteCount: tag._count.notes,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
        }

        sendSuccess(res, tagWithCount)
    } catch (error) {
        next(error)
    }
}

export const getNotesByTag = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { slug } = req.params
        const { page, limit } = req.query
        const { skip, take, page: pageNum, limit: limitNum } = getPaginationParams(
            String(page || ''),
            String(limit || ''),
        )

        const tag = await prisma.tag.findUnique({
            where: { slug },
        })

        if (!tag) {
            throw new NotFoundError('Tag not found')
        }

        const [noteTags, total] = await Promise.all([
            prisma.noteTag.findMany({
                where: {
                    tagId: tag.id,
                    note: {
                        status: 'PUBLISHED',
                        type: 'PUBLIC',
                    },
                },
                skip,
                take,
                include: {
                    note: {
                        include: {
                            tags: {
                                include: {
                                    tag: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    note: {
                        createdAt: 'desc',
                    },
                },
            }),
            prisma.noteTag.count({
                where: {
                    tagId: tag.id,
                    note: {
                        status: 'PUBLISHED',
                        type: 'PUBLIC',
                    },
                },
            }),
        ])

        const notes = noteTags.map((nt) => nt.note)

        const notesWithVotes = await Promise.all(
            notes.map(async (note) => {
                const [upvotes, downvotes, userVote] = await Promise.all([
                    prisma.vote.count({
                        where: { noteId: note.id, type: 'UPVOTE' },
                    }),
                    prisma.vote.count({
                        where: { noteId: note.id, type: 'DOWNVOTE' },
                    }),
                    req.user
                        ? prisma.vote.findUnique({
                            where: {
                                noteId_userId: {
                                    noteId: note.id,
                                    userId: req.user.userId,
                                },
                            },
                        })
                        : null,
                ])

                return {
                    ...note,
                    tags: note.tags.map((nt) => ({
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
            }),
        )

        const pagination = createPaginationMeta(pageNum, limitNum, total)
        sendPaginatedSuccess(res, notesWithVotes, pagination)
    } catch (error) {
        next(error)
    }
}

export const getPopularTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = Math.min(50, Number(req.query.limit) || 20)

        const tags = await prisma.tag.findMany({
            take: limit,
            orderBy: {
                notes: {
                    _count: 'desc',
                },
            },
            include: {
                _count: {
                    select: {
                        notes: true,
                    },
                },
            },
        })

        const tagsWithCount = tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            noteCount: tag._count.notes,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
        }))

        sendSuccess(res, tagsWithCount)
    } catch (error) {
        next(error)
    }
}

export const searchTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query
        const search = String(q || '')

        if (!search) {
            sendSuccess(res, [])
            return
        }

        const tags = await prisma.tag.findMany({
            where: {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            },
            take: 20,
            orderBy: {
                notes: {
                    _count: 'desc',
                },
            },
            include: {
                _count: {
                    select: {
                        notes: true,
                    },
                },
            },
        })

        const tagsWithCount = tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            noteCount: tag._count.notes,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
        }))

        sendSuccess(res, tagsWithCount)
    } catch (error) {
        next(error)
    }
}
