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
  name: 'scrape-user-mentions-tool' 
});

export const scrapeUserMentionsTool: ReturnType<typeof createTool> = createTool({
  id: 'scrape-user-mentions',
  description: `Scrape tweets that mention a specific user since a given time.`,
  inputSchema: z.object({
    userName: z.string().describe('Twitter username (without @) to find mentions of'),
    sinceTime: z.string().describe('ISO date string - fetch mentions since this time'),
    maxTweets: z.number().default(20).describe('Maximum number of tweets to scrape (default: 20)')
  }),
  outputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Array of tweet IDs that were scraped'),
    totalTweets: z.number().describe('Total number of tweets scraped'),
    userName: z.string().describe('The username that was mentioned'),
    sinceTime: z.string().describe('The time filter that was used'),
  }),
  execute: async ({ context, runId }) => {
    const { userName, sinceTime, maxTweets = 20 } = context;

    logger.info({ 
      runId,
      userName,
      sinceTime,
      maxTweets
    }, '🐦 Starting user mentions scraping');

    try {
      const params = { 
        userName, 
        sinceTime: new Date(sinceTime) 
      };
      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      logger.info({ 
        runId, 
        userName, 
        sinceTime,
        maxPages, 
        params 
      }, '🚀 Starting user mentions pipeline execution');

      // Build and run the pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.USER_MENTIONS });
      const pipelineResult = await pipeline.run(params, { maxPages });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 User mentions pipeline execution completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        logger.error({ 
          runId, 
          userName,
          sinceTime, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '❌ Invalid pipeline result for user mentions');
        throw new Error(`User mentions scraping returned invalid result for ${userName}`);
      }

      const tweets = pipelineResult.savedTweets;

      const result = {
        tweetIds: tweets.map(tweet => tweet.id),
        totalTweets: tweets.length,
        userName,
        sinceTime,
      };

      logger.info({ 
        runId, 
        totalTweets: result.totalTweets,
        userName: result.userName,
        sinceTime: result.sinceTime,
        tweetIds: result.tweetIds.slice(0, 5) // Log first 5 IDs only
      }, '✅ User mentions scraping completed successfully');

      return result;
    } catch (error) {
      const errorMsg = `Failed to scrape mentions for user ${userName}: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        userName,
        sinceTime, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ User mentions scraper tool failed');
      
      throw new Error(errorMsg);
    }
  },
});
