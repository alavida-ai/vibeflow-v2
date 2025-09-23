import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getTweetsByIds } from '@vibeflow/core';

export const fetchSavedTweetsTool: ReturnType<typeof createTool> = createTool({
  id: 'fetch-saved-tweets',
  description: `Fetch a user\'s tweets data including media descriptions.`,
  inputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Saved tweet IDs to fetch for analysis'),
  }),
  outputSchema: z.object({
    tweets: z.array(z.any())
  }),
  execute: async ({ context }) => {
    try {
      const tweets = await getTweetsByIds(context.tweetIds);

      return {
        tweets: tweets
      };
    } catch (error) {
      throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});