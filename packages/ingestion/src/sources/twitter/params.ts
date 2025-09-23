import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                         ENDPOINT PARAMETER TYPES                          */
/* -------------------------------------------------------------------------- */

// Specific parameter schemas for each endpoint
export const userLastTweetsParamsSchema = z.object({
  userName: z.string().describe('Twitter username to fetch tweets for'),
});

export const userMentionsParamsSchema = z.object({
  userName: z.string().describe('Twitter username to fetch mentions for'),
  sinceTime: z.date().describe('Fetch mentions since this time'),
});

export const advancedSearchParamsSchema = z.object({
  query: z.string().describe('Search query for tweets'),
  queryType: z.enum(['Latest', 'Top']).describe('Type of search - Latest or Top tweets'),
});

export const tweetRepliesParamsSchema = z.object({
  tweetId: z.string().describe('Tweet ID to fetch replies for'),
});

export const tweetsByIdsParamsSchema = z.object({
  tweetIds: z.array(z.string()).describe('Tweet IDs to fetch'),
});

/* -------------------------------------------------------------------------- */
/*                              TYPE EXPORTS                                 */
/* -------------------------------------------------------------------------- */
export type UserLastTweetsParams = z.infer<typeof userLastTweetsParamsSchema>;
export type UserMentionsParams = z.infer<typeof userMentionsParamsSchema>;
export type AdvancedSearchParams = z.infer<typeof advancedSearchParamsSchema>;
export type TweetRepliesParams = z.infer<typeof tweetRepliesParamsSchema>;
export type TweetsByIdsParams = z.infer<typeof tweetsByIdsParamsSchema>;