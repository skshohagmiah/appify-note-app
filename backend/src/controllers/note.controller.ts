import { Response, NextFunction } from 'express'
import prisma from '@/config/database.config'
import { AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendPaginatedSuccess } from '@/utils/response.util'
import { NotFoundError, ForbiddenError } from '@/utils/errors.util'
import { getPaginationParams, createPaginationMeta } from '@/utils/pagination.util'
import { generateUniqueTagSlug } from '@/utils/slug.util'
import { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '@/validators/note.validator'
import { Prisma } from '@prisma/client'
import { cacheUtil } from '@/utils/cache.util'

export const getPublicNotes = async (
    req: AuthRequest<object, object, object, NoteQueryInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { search, tags, sortBy, page, limit, status, type } = req.query
        const { skip, take, page: pageNum, limit: limitNum } = getPaginationParams(
            String(page || ''),
            String(limit || ''),
        )

        // Base constraints: Public and Published only
        const andConditions: Prisma.NoteWhereInput[] = [
            { status: 'PUBLISHED' },
            { type: 'PUBLIC' }
        ]

        if (status && status !== 'all') {
            andConditions.push({ status: status as any })
        }

        if (type && type !== 'all') {
            andConditions.push({ type: type as any })
        }

        if (search) {
            andConditions.push({
                OR: [
                    {
                        title: {
                            contains: search as string,
                            mode: 'insensitive',
                        }
                    },
                    {
                        content: {
                            contains: search as string,
                            mode: 'insensitive',
                        }
                    }
                ]
            })
        }

        if (tags) {
            const tagArray = (tags as string).split(',').map((t) => t.trim())
            andConditions.push({
                tags: {
                    some: {
                        tag: {
                            slug: {
                                in: tagArray,
                            },
                        },
                    },
                },
            })
        }

        const where: Prisma.NoteWhereInput = {
            AND: andConditions
        }

        let orderBy: Prisma.NoteOrderByWithRelationInput = { createdAt: 'desc' }

        if (sortBy === 'oldest') {
            orderBy = { createdAt: 'asc' }
        } else if (sortBy === 'most_upvoted') {
            orderBy = { upvotes: 'desc' } as any
        } else if (sortBy === 'most_downvoted') {
            orderBy = { downvotes: 'desc' } as any
        }

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: {
                            votes: true,
                        },
                    },
                },
            }),
            prisma.note.count({ where }),
        ])

        // Get vote counts and user's vote for each note
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
                    id: note.id,
                    title: note.title,
                    content: note.content,
                    workspaceId: note.workspaceId,
                    createdBy: note.createdBy,
                    status: note.status,
                    type: note.type,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    tags: note.tags.map((nt) => ({
                        id: nt.tag.id,
                        name: nt.tag.name,
                        slug: nt.tag.slug,
                        noteCount: 0, // Will be populated separately if needed
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

export const getWorkspaceNotes = async (
    req: AuthRequest<{ workspaceId: string }, object, object, NoteQueryInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { workspaceId } = req.params
        const { search, status, type, page, limit } = req.query
        const { skip, take, page: pageNum, limit: limitNum } = getPaginationParams(
            String(page || ''),
            String(limit || ''),
        )

        // Verify workspace belongs to user's company
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this workspace')
        }

        const where: Prisma.NoteWhereInput = {
            workspaceId,
        }

        if (search) {
            where.title = {
                contains: search,
                mode: 'insensitive',
            }
        }

        if (status && status !== 'all') {
            where.status = status
        }

        if (type && type !== 'all') {
            where.type = type
        }

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            }),
            prisma.note.count({ where }),
        ])

        const notesWithVotes = await Promise.all(
            notes.map(async (note) => {
                const [upvotes, downvotes, userVote] = await Promise.all([
                    prisma.vote.count({
                        where: { noteId: note.id, type: 'UPVOTE' },
                    }),
                    prisma.vote.count({
                        where: { noteId: note.id, type: 'DOWNVOTE' },
                    }),
                    prisma.vote.findUnique({
                        where: {
                            noteId_userId: {
                                noteId: note.id,
                                userId: req.user!.userId,
                            },
                        },
                    }),
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

export const getNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await prisma.note.findUnique({
            where: { id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                workspace: true,
            },
        })

        if (!note) {
            throw new NotFoundError('Note not found')
        }

        // Check access permissions
        if (note.type === 'PRIVATE' || note.status === 'DRAFT') {
            if (!req.user) {
                throw new ForbiddenError('Authentication required to access this note')
            }

            if (note.workspace.companyId !== req.user.companyId) {
                throw new ForbiddenError('Access denied to this note')
            }
        }

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

        const noteWithVotes = {
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

        sendSuccess(res, noteWithVotes)
    } catch (error) {
        next(error)
    }
}

export const createNote = async (
    req: AuthRequest<object, object, CreateNoteInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { title, content, workspaceId, tags, type, status } = req.body

        // Verify workspace belongs to user's company
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        })

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this workspace')
        }

        // Create or find tags
        const tagRecords = await Promise.all(
            tags.map(async (tagName) => {
                const slug = await generateUniqueTagSlug(tagName)
                return prisma.tag.upsert({
                    where: { slug },
                    create: {
                        name: tagName,
                        slug,
                    },
                    update: {},
                })
            }),
        )

        // Create note with tags
        const note = await prisma.note.create({
            data: {
                title,
                content,
                workspaceId,
                createdBy: req.user.userId,
                type,
                status,
                tags: {
                    create: tagRecords.map((tag) => ({
                        tagId: tag.id,
                    })),
                },
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        })

        const noteResponse = {
            ...note,
            tags: note.tags.map((nt) => ({
                id: nt.tag.id,
                name: nt.tag.name,
                slug: nt.tag.slug,
                noteCount: 0,
            })),
            votes: {
                upvotes: 0,
                downvotes: 0,
                userVote: null,
            },
        }

        // Invalidate public notes cache if the new note is public
        if (type === 'PUBLIC' && status === 'PUBLISHED') {
            await cacheUtil.delPattern('public-notes:*')
        }

        sendSuccess(res, noteResponse, 'Note created successfully', 201)
    } catch (error) {
        next(error)
    }
}

export const updateNote = async (
    req: AuthRequest<{ id: string }, object, UpdateNoteInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params
        const { title, content, tags, type, status } = req.body

        const note = await prisma.note.findUnique({
            where: { id },
            include: {
                workspace: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        })

        if (!note) {
            throw new NotFoundError('Note not found')
        }

        if (note.workspace.companyId !== req.user.companyId) {
            throw new ForbiddenError('Access denied to this note')
        }

        // Create history entry before updating
        await prisma.noteHistory.create({
            data: {
                noteId: note.id,
                previousTitle: note.title,
                previousContent: note.content,
                updatedBy: req.user.userId,
            },
        })

        // Update note
        const updateData: Prisma.NoteUpdateInput = {}

        if (title) updateData.title = title
        if (content) updateData.content = content
        if (type) updateData.type = type
        if (status) updateData.status = status

        // Handle tags if provided
        if (tags) {
            // Delete existing tag relations
            await prisma.noteTag.deleteMany({
                where: { noteId: id },
            })

            // Create or find new tags
            const tagRecords = await Promise.all(
                tags.map(async (tagName) => {
                    const slug = await generateUniqueTagSlug(tagName)
                    return prisma.tag.upsert({
                        where: { slug },
                        create: {
                            name: tagName,
                            slug,
                        },
                        update: {},
                    })
                }),
            )

            updateData.tags = {
                create: tagRecords.map((tag) => ({
                    tagId: tag.id,
                })),
            }
        }

        const updatedNote = await prisma.note.update({
            where: { id },
            data: updateData,
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
                where: { noteId: updatedNote.id, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId: updatedNote.id, type: 'DOWNVOTE' },
            }),
            prisma.vote.findUnique({
                where: {
                    noteId_userId: {
                        noteId: updatedNote.id,
                        userId: req.user.userId,
                    },
                },
            }),
        ])

        const noteResponse = {
            ...updatedNote,
            tags: updatedNote.tags.map((nt) => ({
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

        // Invalidate public notes cache
        await cacheUtil.delPattern('public-notes:*')

        sendSuccess(res, noteResponse, 'Note updated successfully')
    } catch (error) {
        next(error)
    }
}

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params

        const note = await prisma.note.findUnique({
            where: { id },
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

        await prisma.note.delete({
            where: { id },
        })

        // Invalidate public notes cache
        await cacheUtil.delPattern('public-notes:*')

        sendSuccess(res, null, 'Note deleted successfully')
    } catch (error) {
        next(error)
    }
}

export const publishNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params

        const note = await prisma.note.findUnique({
            where: { id },
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

        const updatedNote = await prisma.note.update({
            where: { id },
            data: { status: 'PUBLISHED' },
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
                where: { noteId: updatedNote.id, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId: updatedNote.id, type: 'DOWNVOTE' },
            }),
            prisma.vote.findUnique({
                where: {
                    noteId_userId: {
                        noteId: updatedNote.id,
                        userId: req.user.userId,
                    },
                },
            }),
        ])

        const noteResponse = {
            ...updatedNote,
            tags: updatedNote.tags.map((nt) => ({
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

        // Invalidate public notes cache
        if (updatedNote.type === 'PUBLIC') {
            await cacheUtil.delPattern('public-notes:*')
        }

        sendSuccess(res, noteResponse, 'Note published successfully')
    } catch (error) {
        next(error)
    }
}

export const unpublishNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { id } = req.params

        const note = await prisma.note.findUnique({
            where: { id },
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

        const updatedNote = await prisma.note.update({
            where: { id },
            data: { status: 'DRAFT' },
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
                where: { noteId: updatedNote.id, type: 'UPVOTE' },
            }),
            prisma.vote.count({
                where: { noteId: updatedNote.id, type: 'DOWNVOTE' },
            }),
            prisma.vote.findUnique({
                where: {
                    noteId_userId: {
                        noteId: updatedNote.id,
                        userId: req.user.userId,
                    },
                },
            }),
        ])

        const noteResponse = {
            ...updatedNote,
            tags: updatedNote.tags.map((nt) => ({
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

        // Invalidate public notes cache
        if (updatedNote.type === 'PUBLIC') {
            await cacheUtil.delPattern('public-notes:*')
        }

        sendSuccess(res, noteResponse, 'Note unpublished successfully')
    } catch (error) {
        next(error)
    }
}

export const searchNotes = async (
    req: AuthRequest<object, object, object, NoteQueryInput>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { search, page, limit } = req.query
        const { skip, take, page: pageNum, limit: limitNum } = getPaginationParams(
            String(page || ''),
            String(limit || ''),
        )

        const where: Prisma.NoteWhereInput = {
            status: 'PUBLISHED',
            type: 'PUBLIC',
        }

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    content: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ]
        }

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            }),
            prisma.note.count({ where }),
        ])

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

export const getMyNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new ForbiddenError()
        }

        const { page, limit } = req.query
        const { skip, take, page: pageNum, limit: limitNum } = getPaginationParams(
            String(page || ''),
            String(limit || ''),
        )

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where: {
                    createdBy: req.user.userId,
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            }),
            prisma.note.count({
                where: {
                    createdBy: req.user.userId,
                },
            }),
        ])

        const notesWithVotes = await Promise.all(
            notes.map(async (note) => {
                const [upvotes, downvotes, userVote] = await Promise.all([
                    prisma.vote.count({
                        where: { noteId: note.id, type: 'UPVOTE' },
                    }),
                    prisma.vote.count({
                        where: { noteId: note.id, type: 'DOWNVOTE' },
                    }),
                    prisma.vote.findUnique({
                        where: {
                            noteId_userId: {
                                noteId: note.id,
                                userId: req.user!.userId,
                            },
                        },
                    }),
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
