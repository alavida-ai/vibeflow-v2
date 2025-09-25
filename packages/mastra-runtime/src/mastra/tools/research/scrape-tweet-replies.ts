import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createLogger } from '@vibeflow/logging';
import { 
  TwitterEndpointEnum,
  createTwitterScraperPipeline,
} from '@vibeflow/ingestion';

// Create a dedicated logger for this tool
const logger = createLogger({ 
  context: 'server', 
  name: 'scrape-tweet-replies-tool' 
});

export const scrapeTweetRepliesTool: ReturnType<typeof createTool> = createTool({
  id: 'scrape-tweet-replies',
  description: `Scrape replies to a specific tweet.`,
  inputSchema: z.object({
    tweetId: z.string().describe('Tweet ID to get replies for'),
    maxTweets: z.number().default(20).describe('Maximum number of replies to scrape (default: 20)')
  }),
  outputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Array of reply tweet IDs that were scraped'),
    totalTweets: z.number().describe('Total number of replies scraped'),
    parentTweetId: z.string().describe('The original tweet ID that was replied to'),
  }),
  execute: async ({ context, runId }) => {
    const { tweetId, maxTweets = 20 } = context;

    logger.info({ 
      runId,
      tweetId,
      maxTweets
    }, '🐦 Starting tweet replies scraping');

    try {
      const params = { tweetId };
      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      logger.info({ 
        runId, 
        tweetId,
        maxPages, 
        params 
      }, '🚀 Starting tweet replies pipeline execution');

      // Build and run the pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.TWEET_REPLIES });
      const pipelineResult = await pipeline.run(params, { maxPages });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 Tweet replies pipeline execution completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        logger.error({ 
          runId, 
          tweetId, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '❌ Invalid pipeline result for tweet replies');
        throw new Error(`Tweet replies scraping returned invalid result for tweet: ${tweetId}`);
      }

      const tweets = pipelineResult.savedTweets;

      const result = {
        tweetIds: tweets.map(tweet => tweet.id),
        totalTweets: tweets.length,
        parentTweetId: tweetId,
      };

      logger.info({ 
        runId, 
        totalTweets: result.totalTweets,
        parentTweetId: result.parentTweetId,
        tweetIds: result.tweetIds.slice(0, 5) // Log first 5 IDs only
      }, '✅ Tweet replies scraping completed successfully');

      return result;
    } catch (error) {
      const errorMsg = `Failed to scrape replies for tweet ${tweetId}: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        tweetId, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ Tweet replies scraper tool failed');
      
      throw new Error(errorMsg);
    }
  },
});
