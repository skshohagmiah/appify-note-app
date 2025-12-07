import { z } from 'zod'

export const voteSchema = z.object({
    body: z.object({
        type: z.enum(['upvote', 'downvote'], {
            required_error: 'Vote type is required',
            invalid_type_error: 'Vote type must be either upvote or downvote',
        }),
    }),
})

export type VoteInput = z.infer<typeof voteSchema>['body']
