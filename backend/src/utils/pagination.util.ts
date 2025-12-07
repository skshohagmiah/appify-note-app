export interface PaginationParams {
    page?: number
    limit?: number
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export const getPaginationParams = (
    page?: string | number,
    limit?: string | number,
): { skip: number; take: number; page: number; limit: number } => {
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))

    return {
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        page: pageNum,
        limit: limitNum,
    }
}

export const createPaginationMeta = (
    page: number,
    limit: number,
    total: number,
): PaginationMeta => {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    }
}
