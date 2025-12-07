import prisma from '@/config/database.config'

export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export const generateUniqueWorkspaceSlug = async (
    name: string,
    companyId: string,
): Promise<string> => {
    let slug = generateSlug(name)
    let counter = 1

    while (true) {
        const existing = await prisma.workspace.findUnique({
            where: {
                companyId_slug: {
                    companyId,
                    slug,
                },
            },
        })

        if (!existing) {
            return slug
        }

        slug = `${generateSlug(name)}-${counter}`
        counter++
    }
}

export const generateUniqueTagSlug = async (name: string): Promise<string> => {
    let slug = generateSlug(name)
    let counter = 1

    while (true) {
        const existing = await prisma.tag.findUnique({
            where: { slug },
        })

        if (!existing) {
            return slug
        }

        slug = `${generateSlug(name)}-${counter}`
        counter++
    }
}
