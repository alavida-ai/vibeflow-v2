import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getTweetsByIds } from '@vibeflow/core';
import { createLogger } from '@vibeflow/logging';

const inputSchema = z.object({
  tweetIds: z.array(z.number()).describe('Saved tweet IDs to fetch for analysis'),
  limit: z.number().optional().describe('Limit the number of tweets to fetch'),
});

type InputSchema = z.infer<typeof inputSchema>;

// Create a dedicated logger for this tool
const logger = createLogger({ 
  context: 'cli', 
  name: 'fetch-saved-tweets-tool' 
});

export const fetchSavedTweetsTool: ReturnType<typeof createTool> = createTool({
  id: 'fetch-saved-tweets',
  description: `Fetch a tweet data by their IDs.`,
  inputSchema: inputSchema,
  outputSchema: z.object({
    tweets: z.array(z.any()).describe('Array of tweet data')
  }).describe('Response containing fetched tweets'),
  execute: async ({ context, mastra }) => {
    const { tweetIds, limit } = context as InputSchema;
    logger.info({ tweetIds, limit }, 'Fetching saved tweets');
    try {
      const tweets = await getTweetsByIds(tweetIds, { limit });

      logger.info({ tweets }, 'Fetched saved tweets');

      return {
        tweets: tweets
      };
    } catch (error) {
      logger.error({ error }, 'Failed to fetch saved tweets');
      throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});