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
  name: 'scrape-advanced-search-tool' 
});

export const scrapeAdvancedSearchTool: ReturnType<typeof createTool> = createTool({
  id: 'scrape-advanced-search',
  description: `Search for tweets using an advanced query with Latest or Top posts filter.`,
  inputSchema: z.object({
    query: z.string().describe('Search query for finding tweets'),
    queryType: z.enum(['Latest', 'Top']).default('Latest').describe('Query type - Latest or Top posts'),
    maxTweets: z.number().default(20).describe('Maximum number of tweets to scrape (default: 20)')
  }),
  outputSchema: z.object({
    tweetIds: z.array(z.number()).describe('Array of tweet IDs that were scraped'),
    totalTweets: z.number().describe('Total number of tweets scraped'),
    query: z.string().describe('The search query that was used'),
    queryType: z.string().describe('The query type that was used'),
  }),
  execute: async ({ context, runId }) => {
    const { query, queryType = 'Latest', maxTweets = 20 } = context;

    logger.info({ 
      runId,
      query,
      queryType,
      maxTweets
    }, '🐦 Starting advanced search scraping');

    try {
      const params = { 
        query, 
        queryType 
      };
      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      logger.info({ 
        runId, 
        query,
        queryType,
        maxPages, 
        params 
      }, '🚀 Starting advanced search pipeline execution');

      // Build and run the pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: TwitterEndpointEnum.ADVANCED_SEARCH });
      const pipelineResult = await pipeline.run(params, { maxPages });

      logger.info({ 
        runId, 
        resultKeys: Object.keys(pipelineResult || {}),
        savedTweetsCount: pipelineResult?.savedTweets?.length || 0
      }, '📊 Advanced search pipeline execution completed');

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        logger.error({ 
          runId, 
          query,
          queryType, 
          pipelineResult: pipelineResult ? 'exists but no savedTweets' : 'null/undefined'
        }, '❌ Invalid pipeline result for advanced search');
        throw new Error(`Advanced search returned invalid result for query: ${query}`);
      }

      const tweets = pipelineResult.savedTweets;

      const result = {
        tweetIds: tweets.map(tweet => tweet.id),
        totalTweets: tweets.length,
        query,
        queryType,
      };

      logger.info({ 
        runId, 
        totalTweets: result.totalTweets,
        query: result.query,
        queryType: result.queryType,
        tweetIds: result.tweetIds.slice(0, 5) // Log first 5 IDs only
      }, '✅ Advanced search scraping completed successfully');

      return result;
    } catch (error) {
      const errorMsg = `Failed to search tweets with query "${query}": ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error({ 
        runId, 
        query,
        queryType, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, '❌ Advanced search scraper tool failed');
      
      throw new Error(errorMsg);
    }
  },
});
