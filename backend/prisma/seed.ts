import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { hashPassword } from '../src/utils/password.util'

const prisma = new PrismaClient()

const NUM_COMPANIES = 20 // Scaled up
const NUM_USERS_PER_COMPANY = 10
const NUM_WORKSPACES_PER_COMPANY = 50 // Total ~1000 workspaces
const NUM_NOTES_PER_WORKSPACE = 500 // Total ~500,000 notes
const NUM_TAGS = 50

async function main() {
    console.log('🌱 Starting database seeding...')

    // Create tags first
    console.log('Creating tags...')
    const tags = await Promise.all(
        Array.from({ length: NUM_TAGS }, async (_, i) => {
            const name = faker.word.noun()
            const slug = `${name.toLowerCase()}-${i}`
            return prisma.tag.upsert({
                where: { slug },
                create: {
                    name,
                    slug,
                },
                update: {},
            })
        }),
    )
    console.log(`✅ Created ${tags.length} tags`)

    // Create companies with users, workspaces, and notes
    for (let c = 0; c < NUM_COMPANIES; c++) {
        console.log(`\nCreating company ${c + 1}/${NUM_COMPANIES}...`)

        const company = await prisma.company.create({
            data: {
                name: faker.company.name(),
            },
        })

        // Create users for this company
        const users = await Promise.all(
            Array.from({ length: NUM_USERS_PER_COMPANY }, async (_, u) => {
                return prisma.user.create({
                    data: {
                        email: faker.internet.email(),
                        password: await hashPassword('Password123'),
                        firstName: faker.person.firstName(),
                        lastName: faker.person.lastName(),
                        role: u === 0 ? 'OWNER' : 'MEMBER',
                        companyId: company.id,
                    },
                })
            }),
        )
        console.log(`  ✅ Created ${users.length} users`)

        // Create workspaces for this company
        for (let w = 0; w < NUM_WORKSPACES_PER_COMPANY; w++) {
            const workspaceName = faker.commerce.department()
            const workspace = await prisma.workspace.create({
                data: {
                    name: workspaceName,
                    slug: `${workspaceName.toLowerCase().replace(/\s+/g, '-')}-${w}`,
                    description: faker.lorem.sentence(),
                    companyId: company.id,
                },
            })

            // Create notes for this workspace
            const notes = []
            for (let n = 0; n < NUM_NOTES_PER_WORKSPACE; n++) {
                const randomUser = users[Math.floor(Math.random() * users.length)]
                const isPublic = Math.random() > 0.5
                const isPublished = Math.random() > 0.3

                const note = await prisma.note.create({
                    data: {
                        title: faker.lorem.sentence(),
                        content: faker.lorem.paragraphs(3),
                        workspaceId: workspace.id,
                        createdBy: randomUser.id,
                        type: isPublic ? 'PUBLIC' : 'PRIVATE',
                        status: isPublished ? 'PUBLISHED' : 'DRAFT',
                    },
                })

                // Add random tags to note
                const numTags = Math.floor(Math.random() * 5) + 1
                const randomTags = faker.helpers.arrayElements(tags, numTags)

                await Promise.all(
                    randomTags.map((tag) =>
                        prisma.noteTag.create({
                            data: {
                                noteId: note.id,
                                tagId: tag.id,
                            },
                        }),
                    ),
                )

                notes.push(note)
            }

            // Create votes for public published notes
            const publicNotes = notes.filter(
                (note) => note.type === 'PUBLIC' && note.status === 'PUBLISHED',
            )

            for (const note of publicNotes) {
                // Random number of votes
                const numVotes = Math.floor(Math.random() * 10)
                const votingUsers = faker.helpers.arrayElements(users, numVotes)
                let upvotesCount = 0
                let downvotesCount = 0

                await Promise.all(
                    votingUsers.map((user) => {
                        const type = Math.random() > 0.5 ? 'UPVOTE' : 'DOWNVOTE'
                        if (type === 'UPVOTE') upvotesCount++
                        else downvotesCount++

                        return prisma.vote.create({
                            data: {
                                noteId: note.id,
                                userId: user.id,
                                type,
                            },
                        })
                    }),
                )

                // Update note counts
                await prisma.note.update({
                    where: { id: note.id },
                    data: {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        upvotes: upvotesCount,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        downvotes: downvotesCount,
                    },
                })
            }

            if ((w + 1) % 5 === 0) {
                console.log(`  📝 Created ${(w + 1) * NUM_NOTES_PER_WORKSPACE} notes so far...`)
            }
        }

        console.log(`  ✅ Created ${NUM_WORKSPACES_PER_COMPANY} workspaces with notes`)
    }

    // Get final counts
    const [companyCount, userCount, workspaceCount, noteCount, voteCount] = await Promise.all([
        prisma.company.count(),
        prisma.user.count(),
        prisma.workspace.count(),
        prisma.note.count(),
        prisma.vote.count(),
    ])

    console.log('\n🎉 Seeding completed!')
    console.log(`📊 Final Statistics:`)
    console.log(`   - Companies: ${companyCount}`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Workspaces: ${workspaceCount}`)
    console.log(`   - Notes: ${noteCount}`)
    console.log(`   - Tags: ${tags.length}`)
    console.log(`   - Votes: ${voteCount}`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
