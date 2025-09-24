import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createLogger } from '@vibeflow/logging';
import { 
  TwitterEndpointEnum,
  createTwitterScraperPipeline,
} from '@vibeflow/ingestion';

// Create a dedicated logger for this tool
const logger = createLogger({ 
  context: 'cli', 
  name: 'scrape-user-tweets-tool' 
});

const inputSchema = z.object({
  userName: z.string().describe('Twitter username (without @)'),
  maxTweets: z.number().default(20).describe('Maximum number of tweets to scrape (default: 20)')
});

type InputSchema = z.infer<typeof inputSchema>;

export const scrapeUserTweetsTool: ReturnType<typeof createTool> = createTool({
  id: 'scrape-user-tweets',
  description: `Scrape recent tweets from a specific Twitter user's timeline.`,
  inputSchema: inputSchema,
  outputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Array of tweet IDs that were scraped'),
    totalTweets: z.number().describe('Total number of tweets scraped'),
    userName: z.string().describe('The username that was scraped'),
  }),
  execute: async ({ context, runId }) => {
    const { userName, maxTweets = 20 } = context as InputSchema;

    logger.info({ 
      runId,
      userName,
      maxTweets
    }, '🐦 Starting user tweets scraping');

    try {
      const params = { userName };
      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      logger.info({ 
        runId, 
        userName, 
        maxPages, 
        params 
      }, '🚀 Starting user tweets pipeline execution');

      // Build and run the pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.USER_LAST_TWEETS });
      const pipelineResult = await pipeline.run(params, { maxPages });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 User tweets pipeline execution completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        logger.error({ 
          runId, 
          userName, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '❌ Invalid pipeline result for user tweets');
        throw new Error(`User tweets scraping returned invalid result for ${userName}`);
      }

      const tweets = pipelineResult.savedTweets;

      const result = {
        tweetIds: tweets.map(tweet => tweet.id),
        totalTweets: tweets.length,
        userName,
      };

      logger.info({ 
        runId, 
        totalTweets: result.totalTweets,
        userName: result.userName,
        tweetIds: result.tweetIds.slice(0, 5) // Log first 5 IDs only
      }, '✅ User tweets scraping completed successfully');

      return result;
    } catch (error) {
      const errorMsg = `Failed to scrape tweets for user ${userName}: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        userName, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ User tweets scraper tool failed');
      
      throw new Error(errorMsg);
    }
  },
});
