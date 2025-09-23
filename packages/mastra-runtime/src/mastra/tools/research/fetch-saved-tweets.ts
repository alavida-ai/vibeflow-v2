import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getTweetsByIds } from '@vibeflow/core';

export const fetchSavedTweetsTool: ReturnType<typeof createTool> = createTool({
  id: 'fetch-saved-tweets',
  description: `Fetch a tweet data by their IDs.`,
  inputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Saved tweet IDs to fetch for analysis'),
    limit: z.number().optional().describe('Limit the number of tweets to fetch'),
  }),
  outputSchema: z.object({
    tweets: z.array(z.any())
  }),
  execute: async ({ context }) => {
    const { tweetIds, limit } = context;
    try {
      const tweets = await getTweetsByIds(tweetIds, { limit });

      return {
        tweets: tweets
      };
    } catch (error) {
      throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});