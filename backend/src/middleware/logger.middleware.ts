import morgan from 'morgan'
import { Request, Response } from 'express'

// Custom token for response time
morgan.token('response-time-ms', (req: Request, res: Response) => {
    const responseTime = res.getHeader('X-Response-Time')
    return responseTime ? `${responseTime}ms` : '-'
})

// Development format with colors
export const devLogger = morgan('dev')

// Production format with more details
export const prodLogger = morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
)

// Custom format for API logging
export const apiLogger = morgan(
    ':method :url :status :response-time ms - :res[content-length]',
)

export const getLogger = () => {
    return process.env.NODE_ENV === 'production' ? prodLogger : devLogger
}
