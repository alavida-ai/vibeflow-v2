import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createLogger } from '@vibeflow/logging';
import { 
  userLastTweetsParamsSchema,
  userMentionsParamsSchema,
  advancedSearchParamsSchema,
  tweetRepliesParamsSchema,
  TwitterEndpointEnum,
  createTwitterScraperPipeline,
} from '@vibeflow/ingestion';

// Create a dedicated logger for this tool
const logger = createLogger({ 
  context: 'server', 
  name: 'scrape-tweets-tool' 
});

/* -------------------------------------------------------------------------- */
/*                         TOOL PARAMETER SCHEMAS                            */
/* -------------------------------------------------------------------------- */

// Tool-specific base schema with maxTweets and operation
const toolBaseSchema = z.object({
  maxTweets: z.number().optional().describe('Maximum number of tweets to fetch (default: 20)'),
});

// Build tool schemas by extending the centralized parameter schemas
const toolUserLastTweetsSchema = toolBaseSchema
  .merge(userLastTweetsParamsSchema)
  .extend({
    operation: z.literal(TwitterEndpointEnum.USER_LAST_TWEETS),
  });

const toolUserMentionsSchema = toolBaseSchema
  .merge(userMentionsParamsSchema.omit({ sinceTime: true })) // Remove the Date type
  .extend({
    operation: z.literal(TwitterEndpointEnum.USER_MENTIONS),
    sinceTime: z.string().describe('ISO date string - fetch mentions since this time'), // Add string version for tool input
  });

const toolAdvancedSearchSchema = toolBaseSchema
  .merge(advancedSearchParamsSchema)
  .extend({
    operation: z.literal(TwitterEndpointEnum.ADVANCED_SEARCH),
  });

const toolTweetRepliesSchema = toolBaseSchema
  .merge(tweetRepliesParamsSchema)
  .extend({
    operation: z.literal(TwitterEndpointEnum.TWEET_REPLIES),
  });

const inputSchema = z.discriminatedUnion('operation', [
  toolUserLastTweetsSchema,
  toolUserMentionsSchema,
  toolAdvancedSearchSchema,
  toolTweetRepliesSchema,
]);

export const scrapeTweetsTool: ReturnType<typeof createTool> = createTool({
  id: 'flexible-tweets-scraper',
  description: `Scrape tweets using different Twitter endpoints based on the operation type:
  - userLastTweets: Get a user's recent tweets
  - userMentions: Get tweets that mention a user since a specific time
  - advancedSearch: Search for tweets with an advanced query (by Latest or Top posts)
  - tweetReplies: Get replies to a specific tweet`,
  inputSchema,
  outputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Array of tweet IDs that were scraped'),
    totalTweets: z.number().describe('Total number of tweets scraped'),
    operation: z.string().describe('The operation that was performed'),
    metadata: z.object({
      userName: z.string().optional(),
      query: z.string().optional(),
      tweetId: z.string().optional(),
    }).describe('Additional metadata about the scraping operation'),
  }),
  execute: async ({ context, runId }) => {
    const { operation, maxTweets = 20 } = context;

    // Use dedicated tool logger
    logger.info({ 
      runId,
      operation,
      maxTweets,
      fullContext: context
    }, '🐦 Starting tweet scraping operation');

    try {
      let params: any;
      let metadata: any = {};

      // Prepare parameters and determine endpoint based on operation
      logger.info({ runId, operation }, '🔧 Preparing parameters for operation');

      switch (operation) {
        case TwitterEndpointEnum.USER_LAST_TWEETS:
          params = { userName: context.userName };
          metadata.userName = context.userName;
          logger.info({ runId, params }, '📋 USER_LAST_TWEETS params prepared');
          break;

        case TwitterEndpointEnum.USER_MENTIONS:
          params = { 
            userName: context.userName, 
            sinceTime: new Date(context.sinceTime) 
          };
          metadata.userName = context.userName;
          logger.info({ runId, params }, '📋 USER_MENTIONS params prepared');
          break;

        case TwitterEndpointEnum.ADVANCED_SEARCH:
          params = { 
            query: context.query, 
            queryType: context.queryType 
          };
          metadata.query = context.query;
          logger.info({ runId, params }, '📋 ADVANCED_SEARCH params prepared');
          break;

        case TwitterEndpointEnum.TWEET_REPLIES:
          params = { tweetId: context.tweetId };
          metadata.tweetId = context.tweetId;
          logger.info({ runId, params }, '📋 TWEET_REPLIES params prepared');
          break;

        default:
          const errorMsg = `Unsupported operation: ${operation}`;
          logger.error({ runId, operation, availableOperations: Object.values(TwitterEndpointEnum) }, '❌ Unsupported operation');
          throw new Error(errorMsg);
      }

      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      logger.info({ 
        runId, 
        operation, 
        maxPages, 
        params 
      }, '🚀 Starting pipeline execution');

      // Build and run the pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: operation });
      const pipelineResult = await pipeline.run(params, { maxPages });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 Pipeline execution completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        const errorMsg = `${operation} returned invalid result`;
        logger.error({ 
          runId, 
          operation, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '❌ Invalid pipeline result');
        throw new Error(errorMsg);
      }

      const tweets = pipelineResult.savedTweets;

      const result = {
        tweetIds: tweets.map(tweet => tweet.id),
        totalTweets: tweets.length,
        operation,
        metadata,
      };

      logger.info({ 
        runId, 
        totalTweets: result.totalTweets,
        operation: result.operation,
        metadata: result.metadata
      }, '✅ Tweet scraping completed successfully');

      return result;
    } catch (error) {
      const errorMsg = `Failed to scrape tweets with ${operation}: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        operation, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ Twitter scraper tool failed');
      
      throw new Error(errorMsg);
    }
  },
});