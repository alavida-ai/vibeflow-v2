import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createLogger } from '@vibeflow/logging';
import { 
  TwitterEndpointEnum,
  TwitterClient,
  TweetsByIdsEndpoint
} from '@vibeflow/ingestion';
import { TweetTransformer } from '@vibeflow/ingestion';
import { TweetSink } from '@vibeflow/ingestion';
import { TwitterPipeline } from '@vibeflow/ingestion';

// Create a dedicated logger for this tool
const logger = createLogger({ 
  context: 'server', 
  name: 'scrape-tweet-by-id-tool' 
});

export const scrapeTweetByIdTool: ReturnType<typeof createTool> = createTool({
  id: 'scrape-tweet-by-id',
  description: `Scrape a specific tweet by its ID to get the full tweet details.`,
  inputSchema: z.object({
    tweetId: z.string().describe('Tweet ID to scrape')
  }),
  outputSchema: z.object({
    tweetId: z.number().describe('The tweet ID that was scraped'),
    success: z.boolean().describe('Whether the tweet was successfully scraped'),
    tweetData: z.any().optional().describe('The scraped tweet data if available'),
  }),
  execute: async ({ context, runId }) => {
    const { tweetId } = context;

    logger.info({ 
      runId,
      tweetId
    }, '🐦 Starting tweet by ID scraping');

    try {
      // Use TWEETS_BY_IDS endpoint with single tweet ID
      const params = { tweetIds: [tweetId] };

      logger.info({ 
        runId, 
        tweetId,
        params 
      }, '🚀 Starting tweet by ID pipeline execution');

      // Create custom pipeline for tweets by IDs since it's not in the factory
      const client = TwitterClient.getInstance();
      const pipeline = new TwitterPipeline({
        source: new TweetsByIdsEndpoint(client),
        transformer: new TweetTransformer(),
        sink: new TweetSink(),
        processors: []
      });

      const pipelineResult = await pipeline.run(params, { maxPages: 1 });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 Tweet by ID pipeline execution completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets || pipelineResult.savedTweets.length === 0) {
        logger.warn({ 
          runId, 
          tweetId, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '⚠️ No tweet found or invalid pipeline result');
        
        return {
          tweetId: parseInt(tweetId),
          success: false,
          tweetData: null,
        };
      }

      const tweet = pipelineResult.savedTweets[0];

      const result = {
        tweetId: tweet.id,
        success: true,
        tweetData: tweet,
      };

      logger.info({ 
        runId, 
        tweetId: result.tweetId,
        success: result.success,
        hasData: !!result.tweetData
      }, '✅ Tweet by ID scraping completed successfully');

      return result;
    } catch (error) {
      const errorMsg = `Failed to scrape tweet with ID ${tweetId}: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        tweetId, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ Tweet by ID scraper tool failed');
      
      // Return failure result instead of throwing
      return {
        tweetId: parseInt(tweetId),
        success: false,
        tweetData: null,
      };
    }
  },
});
