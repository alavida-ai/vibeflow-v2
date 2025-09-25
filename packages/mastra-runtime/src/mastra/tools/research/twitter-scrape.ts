import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createLogger } from '@vibeflow/logging';
import { 
  TwitterEndpointEnum,
  createTwitterScraperPipeline,
  TwitterClient,
 TweetsByIdsEndpoint,
  TweetTransformer,
  TweetSink,
  TwitterPipeline
} from '@vibeflow/ingestion';

// Create a dedicated logger for this tool
const logger = createLogger({ 
  context: 'cli', 
  name: 'twitter-scrape-tool' 
});

/* -------------------------------------------------------------------------- */
/*                              INPUT SCHEMA                                 */
/* -------------------------------------------------------------------------- */

// Tool accepts operation and params as separate fields (required for MCP compatibility)
const inputSchema = z.object({
  operation: z.enum(['user_tweets', 'user_mentions', 'tweet_replies', 'tweet_by_id']).describe('The scraping operation to perform'),
  params: z.object({}).passthrough().describe('Operation-specific parameters'),
});

// Internal schemas for validating operation-specific params
const operationParamsSchemas = {
  user_tweets: z.object({
    userName: z.string().describe('Twitter username (without @)'),
    maxTweets: z.number().default(20).describe('Maximum number of tweets to fetch'),
  }),
  user_mentions: z.object({
    userName: z.string().describe('Twitter username to find mentions of (without @)'),
    sinceTime: z.string().datetime().describe('ISO datetime string to filter tweets since this time'),
    maxTweets: z.number().default(20).describe('Maximum number of tweets to fetch'),
  }),
  tweet_replies: z.object({
    tweetId: z.string().describe('Tweet ID to get replies for'),
    maxTweets: z.number().default(20).describe('Maximum number of reply tweets to fetch'),
  }),
  tweet_by_id: z.object({
    tweetId: z.string().describe('Specific tweet ID to fetch'),
  }),
};

type InputSchema = z.infer<typeof inputSchema>;

/* -------------------------------------------------------------------------- */
/*                              OUTPUT SCHEMA                                */
/* -------------------------------------------------------------------------- */

const outputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful'),
  operation: z.string().describe('The operation that was performed'),
  totalTweets: z.number().describe('Total number of tweets scraped'),
  tweetIds: z.array(z.number()).describe('Array of tweet IDs that were scraped'),
  metadata: z.object({
    userName: z.string().optional().describe('Username involved in the operation'),
    tweetId: z.string().optional().describe('Tweet ID involved in the operation'),
    sinceTime: z.string().optional().describe('Time filter used for the operation'),
  }).describe('Additional metadata about the scraping operation'),
});

/* -------------------------------------------------------------------------- */
/*                                 TOOL                                      */
/* -------------------------------------------------------------------------- */

export const twitterScrapeTool: ReturnType<typeof createTool> = createTool({
  id: 'twitter-scrape',
  description: `Scrape Twitter content from specific sources using operation parameters:
  
  **Operations:**
  - **user_tweets**: Get a user's recent tweets
  - **user_mentions**: Get tweets that mention a user since a specific time  
  - **tweet_replies**: Get replies to a specific tweet
  - **tweet_by_id**: Get a specific tweet by its ID
  
  **Input Examples:**
  - Get recent tweets: { operation: "user_tweets", params: { userName: "elonmusk", maxTweets: 50 } }
  - Get mentions: { operation: "user_mentions", params: { userName: "openai", sinceTime: "2024-01-01T00:00:00Z", maxTweets: 100 } }
  - Get replies: { operation: "tweet_replies", params: { tweetId: "1234567890", maxTweets: 30 } }
  - Get specific tweet: { operation: "tweet_by_id", params: { tweetId: "1234567890" } }`,
  
  inputSchema,
  outputSchema,
  
  execute: async ({ context, runId }) => {
    const { operation, params } = context as InputSchema;

    // Validate params against the operation-specific schema
    const paramsSchema = operationParamsSchemas[operation];
    if (!paramsSchema) {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    const validationResult = paramsSchema.safeParse(params);
    if (!validationResult.success) {
      throw new Error(`Invalid parameters for operation ${operation}: ${validationResult.error.message}`);
    }

    const validatedParams = validationResult.data;

    logger.info({ 
      runId,
      operation,
      params: validatedParams
    }, '🐦 Starting Twitter scrape operation');

    try {
      let result;
      
      switch (operation) {
        case 'user_tweets':
          result = await handleUserTweets(validatedParams as { userName: string; maxTweets: number });
          break;
        case 'user_mentions':
          result = await handleUserMentions(validatedParams as { userName: string; sinceTime: string; maxTweets: number });
          break;
        case 'tweet_replies':
          result = await handleTweetReplies(validatedParams as { tweetId: string; maxTweets: number });
          break;
        case 'tweet_by_id':
          result = await handleTweetById(validatedParams as { tweetId: string });
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      logger.info({ 
        runId, 
        operation,
        totalTweets: result.totalTweets,
        success: result.success
      }, '✅ Twitter scrape operation completed');

      return result;
      
    } catch (error) {
      const errorMsg = `Twitter scrape failed for operation ${operation}: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        operation,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ Twitter scrape operation failed');
      
      throw new Error(errorMsg);
    }
  },
});

/* -------------------------------------------------------------------------- */
/*                            OPERATION HANDLERS                             */
/* -------------------------------------------------------------------------- */

async function handleUserTweets(params: { userName: string; maxTweets: number }) {
  const { userName, maxTweets } = params;
  
  const requestParams = { userName };
  const maxPages = Math.max(1, Math.floor(maxTweets / 20));
  
  logger.info({ requestParams, maxPages }, '📋 Executing user_tweets operation');
  
  const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.USER_LAST_TWEETS });
  const pipelineResult = await pipeline.run(requestParams, { maxPages });
  
  if (!pipelineResult?.savedTweets) {
    throw new Error('Invalid pipeline result for user tweets');
  }
  
  return {
    success: true,
    operation: 'user_tweets',
    totalTweets: pipelineResult.savedTweets.length,
    tweetIds: pipelineResult.savedTweets.map(tweet => tweet.id),
    metadata: { userName }
  };
}

async function handleUserMentions(params: { userName: string; sinceTime: string; maxTweets: number }) {
  const { userName, sinceTime, maxTweets } = params;
  
  const requestParams = { 
    userName, 
    sinceTime: new Date(sinceTime) 
  };
  const maxPages = Math.max(1, Math.floor(maxTweets / 20));
  
  logger.info({ requestParams, maxPages }, '📋 Executing user_mentions operation');
  
  const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.USER_MENTIONS });
  const pipelineResult = await pipeline.run(requestParams, { maxPages });
  
  if (!pipelineResult?.savedTweets) {
    throw new Error('Invalid pipeline result for user mentions');
  }
  
  return {
    success: true,
    operation: 'user_mentions',
    totalTweets: pipelineResult.savedTweets.length,
    tweetIds: pipelineResult.savedTweets.map(tweet => tweet.id),
    metadata: { userName, sinceTime }
  };
}

async function handleTweetReplies(params: { tweetId: string; maxTweets: number }) {
  const { tweetId, maxTweets } = params;
  
  const requestParams = { tweetId };
  const maxPages = Math.max(1, Math.floor(maxTweets / 20));
  
  logger.info({ requestParams, maxPages }, '📋 Executing tweet_replies operation');
  
  const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.TWEET_REPLIES });
  const pipelineResult = await pipeline.run(requestParams, { maxPages });
  
  if (!pipelineResult?.savedTweets) {
    throw new Error('Invalid pipeline result for tweet replies');
  }
  
  return {
    success: true,
    operation: 'tweet_replies',
    totalTweets: pipelineResult.savedTweets.length,
    tweetIds: pipelineResult.savedTweets.map(tweet => tweet.id),
    metadata: { tweetId }
  };
}

async function handleTweetById(params: { tweetId: string }) {
  try {
  const { tweetId } = params;
  
  const requestParams = { tweetIds: [tweetId] };
  
  logger.info({ requestParams }, '📋 Executing tweet_by_id operation');
  
  // Create custom pipeline for tweets by IDs (not in factory)
  const client = TwitterClient.getInstance();
  const pipeline = new TwitterPipeline({
    source: new TweetsByIdsEndpoint(client),
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors: []
  });
  
  const pipelineResult = await pipeline.run(requestParams, { maxPages: 1 });
  
  if (!pipelineResult?.savedTweets || pipelineResult.savedTweets.length === 0) {
    throw new Error('Invalid pipeline result for tweet by id');
  }
  
  return {
    success: true,
    operation: 'tweet_by_id',
    totalTweets: pipelineResult.savedTweets.length,
    tweetIds: pipelineResult.savedTweets.map(tweet => tweet.id),
    metadata: { tweetId }
  };
  } catch (error) {
    logger.error({ error, params }, '💥 Pipeline failed with error:');
    return {
      success: false,
      operation: 'tweet_by_id',
      totalTweets: 0,
      tweetIds: [],
      metadata: { tweetId: params.tweetId }
    };
    
  }
}

