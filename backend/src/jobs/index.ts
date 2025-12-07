import {
    createHistoryCleanupQueue,
    createHistoryCleanupWorker,
    scheduleHistoryCleanup,
} from './history-cleanup.job'

export const initializeJobs = async () => {
    const queue = createHistoryCleanupQueue()
    const worker = createHistoryCleanupWorker()

    if (queue && worker) {
        await scheduleHistoryCleanup(queue)
        console.log('✅ All background jobs initialized')
    } else {
        console.warn('⚠️  Background jobs not initialized (Redis unavailable)')
    }
}

export default initializeJobs
