import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createUserLastTweetsPipeline } from '@vibeflow/ingestion';

export const userTweetsFetcherTool: ReturnType<typeof createTool> = createTool({
  id: 'user-tweets-fetcher',
  description: `Fetch a user\'s tweets data including media descriptions.`,
  inputSchema: z.object({
    userName: z.string().describe('Twitter username to fetch tweets for'),
  }),
  outputSchema: z.object({
    tweetIds: z.array(z.number()),
    username: z.string()
  }),
  execute: async ({ context }) => {
    const { username } = context;

    try {
      
      const tweetIngestionPipeline = createUserLastTweetsPipeline();
      const pipelineResult = await tweetIngestionPipeline.run({ username }, { maxPages: 1 });

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        throw new Error('Twitter analysis returned invalid result');
      }

      const tweets = pipelineResult.savedTweets;

      const totalTweets = tweets.length;

      return {
        tweetIds: tweets.map(tweet => tweet.id),
        username: username
      };
    } catch (error) {
      console.error('❌ Twitter scraper tool failed:', error);
      throw new Error(`Failed to scrape tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});