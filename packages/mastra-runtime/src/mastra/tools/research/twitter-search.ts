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
  name: 'twitter-search-tool' 
});

/* -------------------------------------------------------------------------- */
/*                              INPUT SCHEMA                                 */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  query: z.string().describe('Search query for finding tweets'),
  queryType: z.enum(['Latest', 'Top']).default('Latest').describe('Query type - Latest or Top posts'),
  maxTweets: z.number().default(20).describe('Maximum number of tweets to search (default: 20)'),
});

type InputSchema = z.infer<typeof inputSchema>;

/* -------------------------------------------------------------------------- */
/*                              OUTPUT SCHEMA                                */
/* -------------------------------------------------------------------------- */

const outputSchema = z.object({
  success: z.boolean().describe('Whether the search was successful'),
  operation: z.literal('search').describe('The operation that was performed'),
  totalTweets: z.number().describe('Total number of tweets found'),
  tweetIds: z.array(z.number()).describe('Array of tweet IDs that were found'),
  metadata: z.object({
    query: z.string().describe('The search query that was used'),
    queryType: z.string().describe('The query type that was used'),
  }).describe('Search metadata'),
});

/* -------------------------------------------------------------------------- */
/*                                 TOOL                                      */
/* -------------------------------------------------------------------------- */

export const twitterSearchTool: ReturnType<typeof createTool> = createTool({
  id: 'twitter-search',
  description: `Search for tweets using advanced query filtering.
  
  **Features:**
  - Search with custom queries (keywords, hashtags, mentions, etc.)
  - Filter by Latest or Top posts
  - Configurable result limits
  
  **Query Examples:**
  - Basic: "artificial intelligence"
  - Hashtag: "#AI #MachineLearning"  
  - Mentions: "@openai OR @anthropic"
  - Complex: "AI safety -crypto from:elonmusk"
  
  **Query Types:**
  - **Latest**: Most recent tweets matching query
  - **Top**: Most popular/engaging tweets matching query
  
  **Usage Examples:**
  - Latest AI tweets: { query: "artificial intelligence", queryType: "Latest", maxTweets: 50 }
  - Top crypto posts: { query: "#crypto #bitcoin", queryType: "Top", maxTweets: 100 }`,
  
  inputSchema,
  outputSchema,
  
  execute: async ({ context, runId }) => {
    const { query, queryType = 'Latest', maxTweets = 20 } = context as InputSchema;

    logger.info({ 
      runId,
      query,
      queryType,
      maxTweets
    }, '🔍 Starting Twitter search operation');

    try {
      const params = { 
        query, 
        queryType 
      };
      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      logger.info({ 
        runId, 
        params,
        maxPages 
      }, '🚀 Executing Twitter search pipeline');

      // Build and run the advanced search pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.ADVANCED_SEARCH });
      const pipelineResult = await pipeline.run(params, { maxPages });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 Twitter search pipeline completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        logger.error({ 
          runId, 
          query,
          queryType, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '❌ Invalid pipeline result for Twitter search');
        
        throw new Error(`Twitter search returned invalid result for query: ${query}`);
      }

      const tweets = pipelineResult.savedTweets;

      const result = {
        success: true,
        operation: 'search' as const,
        totalTweets: tweets.length,
        tweetIds: tweets.map(tweet => tweet.id),
        metadata: {
          query,
          queryType,
        }
      };

      logger.info({ 
        runId, 
        totalTweets: result.totalTweets,
        query: result.metadata.query,
        queryType: result.metadata.queryType,
        tweetIds: result.tweetIds.slice(0, 5) // Log first 5 IDs only
      }, '✅ Twitter search completed successfully');

      return result;
      
    } catch (error) {
      const errorMsg = `Twitter search failed for query "${query}": ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        query,
        queryType, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ Twitter search operation failed');
      
      throw new Error(errorMsg);
    }
  },
});
