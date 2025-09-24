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

// Tool accepts a JSON string that contains the operation parameters
const inputSchema = z
  .string()
  .describe('JSON string containing operation parameters. See examples below for format.');

// Internal schema for validating the parsed JSON
const operationSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('user_tweets'),
    userName: z.string().describe('Twitter username (without @)'),
    maxTweets: z.number().default(20).describe('Maximum number of tweets to fetch'),
  }),
  z.object({
    operation: z.literal('user_mentions'),
    userName: z.string().describe('Twitter username to find mentions of (without @)'),
    sinceTime: z.string().datetime().describe('ISO datetime string to filter tweets since this time'),
    maxTweets: z.number().default(20).describe('Maximum number of tweets to fetch'),
  }),
  z.object({
    operation: z.literal('tweet_replies'),
    tweetId: z.string().describe('Tweet ID to get replies for'),
    maxTweets: z.number().default(20).describe('Maximum number of reply tweets to fetch'),
  }),
  z.object({
    operation: z.literal('tweet_by_id'),
    tweetId: z.string().describe('Specific tweet ID to fetch'),
  }),
]);

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
  description: `Scrape Twitter content from specific sources using JSON-formatted operation parameters:
  
  **Operations:**
  - **user_tweets**: Get a user's recent tweets
  - **user_mentions**: Get tweets that mention a user since a specific time  
  - **tweet_replies**: Get replies to a specific tweet
  - **tweet_by_id**: Get a specific tweet by its ID
  
  **Input Format:** Pass a JSON string with the operation parameters.
  
  **JSON Examples:**
  - Get recent tweets: '{"operation": "user_tweets", "userName": "elonmusk", "maxTweets": 50}'
  - Get mentions: '{"operation": "user_mentions", "userName": "openai", "sinceTime": "2024-01-01T00:00:00Z", "maxTweets": 100}'
  - Get replies: '{"operation": "tweet_replies", "tweetId": "1234567890", "maxTweets": 30}'
  - Get specific tweet: '{"operation": "tweet_by_id", "tweetId": "1234567890"}'`,
  
  inputSchema,
  outputSchema,
  
  execute: async ({ context, runId }) => {
    // Parse JSON string input
    let parsedContext;
    try {
      parsedContext = JSON.parse(context as string);
    } catch (error) {
      throw new Error(`Invalid JSON input: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Validate parsed JSON against operation schema
    const validationResult = operationSchema.safeParse(parsedContext);
    if (!validationResult.success) {
      throw new Error(`Invalid operation parameters: ${validationResult.error.message}`);
    }

    const operationData = validationResult.data;
    const { operation } = operationData;

    logger.info({ 
      runId,
      operation,
      operationData
    }, '🐦 Starting Twitter scrape operation');

    try {
      let result;
      
      switch (operation) {
        case 'user_tweets':
          result = await handleUserTweets(operationData);
          break;
        case 'user_mentions':
          result = await handleUserMentions(operationData);
          break;
        case 'tweet_replies':
          result = await handleTweetReplies(operationData);
          break;
        case 'tweet_by_id':
          result = await handleTweetById(operationData);
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

async function handleUserTweets(context: { operation: 'user_tweets'; userName: string; maxTweets: number }) {
  const { userName, maxTweets } = context;
  
  const params = { userName };
  const maxPages = Math.max(1, Math.floor(maxTweets / 20));
  
  logger.info({ params, maxPages }, '📋 Executing user_tweets operation');
  
  const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.USER_LAST_TWEETS });
  const pipelineResult = await pipeline.run(params, { maxPages });
  
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

async function handleUserMentions(context: { operation: 'user_mentions'; userName: string; sinceTime: string; maxTweets: number }) {
  const { userName, sinceTime, maxTweets } = context;
  
  const params = { 
    userName, 
    sinceTime: new Date(sinceTime) 
  };
  const maxPages = Math.max(1, Math.floor(maxTweets / 20));
  
  logger.info({ params, maxPages }, '📋 Executing user_mentions operation');
  
  const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.USER_MENTIONS });
  const pipelineResult = await pipeline.run(params, { maxPages });
  
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

async function handleTweetReplies(context: { operation: 'tweet_replies'; tweetId: string; maxTweets: number }) {
  const { tweetId, maxTweets } = context;
  
  const params = { tweetId };
  const maxPages = Math.max(1, Math.floor(maxTweets / 20));
  
  logger.info({ params, maxPages }, '📋 Executing tweet_replies operation');
  
  const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.TWEET_REPLIES });
  const pipelineResult = await pipeline.run(params, { maxPages });
  
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

async function handleTweetById(context: { operation: 'tweet_by_id'; tweetId: string }) {
  try {
  const { tweetId } = context;
  
  const params = { tweetIds: [tweetId] };
  
  logger.info({ params }, '📋 Executing tweet_by_id operation');
  
  // Create custom pipeline for tweets by IDs (not in factory)
  const client = TwitterClient.getInstance();
  const pipeline = new TwitterPipeline({
    source: new TweetsByIdsEndpoint(client),
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors: []
  });
  
  const pipelineResult = await pipeline.run(params, { maxPages: 1 });
  
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
    logger.error({ error, context }, '💥 Pipeline failed with error:');
    return {
      success: false,
      operation: 'tweet_by_id',
      totalTweets: 0,
      tweetIds: [],
      metadata: { tweetId: context.tweetId }
    };
    
  }
}

