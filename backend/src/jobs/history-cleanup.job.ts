import { Queue, Worker } from 'bullmq'
import { getRedisClient } from '@/config/redis.config'
import prisma from '@/config/database.config'

const HISTORY_RETENTION_DAYS = Number(process.env.HISTORY_RETENTION_DAYS) || 7

export const createHistoryCleanupQueue = () => {
    const redis = getRedisClient()
    if (!redis) return null

    const queue = new Queue('history-cleanup', {
        connection: redis,
    })

    return queue
}

export const createHistoryCleanupWorker = () => {
    const redis = getRedisClient()
    if (!redis) return null

    const worker = new Worker(
        'history-cleanup',
        async (job) => {
            console.log('🧹 Starting history cleanup job...')

            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.setDate(cutoffDate.getDate() - HISTORY_RETENTION_DAYS))

            try {
                const result = await prisma.noteHistory.deleteMany({
                    where: {
                        createdAt: {
                            lt: cutoffDate,
                        },
                    },
                })

                console.log(`✅ Deleted ${result.count} old history entries`)
                return { deletedCount: result.count }
            } catch (error) {
                console.error('❌ History cleanup job failed:', error)
                throw error
            }
        },
        {
            connection: redis,
        },
    )

    worker.on('completed', (job) => {
        console.log(`✅ History cleanup job ${job.id} completed`)
    })

    worker.on('failed', (job, err) => {
        console.error(`❌ History cleanup job ${job?.id} failed:`, err)
    })

    return worker
}

export const scheduleHistoryCleanup = async (queue: Queue) => {
    // Schedule daily cleanup at 2:00 AM
    await queue.add(
        'cleanup',
        {},
        {
            repeat: {
                pattern: '0 2 * * *', // Cron: Every day at 2:00 AM
            },
        },
    )

    console.log('📅 History cleanup job scheduled (daily at 2:00 AM)')
}
