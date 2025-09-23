import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { 
  userLastTweetsParamsSchema,
  userMentionsParamsSchema,
  advancedSearchParamsSchema,
  tweetRepliesParamsSchema,
  TwitterEndpointEnum,
  createTwitterScraperPipeline,
} from '@vibeflow/ingestion';

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
  execute: async ({ context }) => {
    const { operation, maxTweets = 20 } = context;

    try {
      let params: any;
      let metadata: any = {};

      // Prepare parameters and determine endpoint based on operation
      switch (operation) {
        case TwitterEndpointEnum.USER_LAST_TWEETS:
          params = { userName: context.userName };
          metadata.userName = context.userName;
          break;

        case TwitterEndpointEnum.USER_MENTIONS:
          params = { 
            userName: context.userName, 
            sinceTime: new Date(context.sinceTime) 
          };
          metadata.userName = context.userName;
          break;

        case TwitterEndpointEnum.ADVANCED_SEARCH:
          params = { 
            query: context.query, 
            queryType: context.queryType 
          };
          metadata.query = context.query;
          break;

        case TwitterEndpointEnum.TWEET_REPLIES:
          params = { tweetId: context.tweetId };
          metadata.tweetId = context.tweetId;
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      const maxPages = Math.max(1, Math.floor(maxTweets / 20));

      // Build and run the pipeline
      const pipeline = createTwitterScraperPipeline({ endpoint: operation });
      const pipelineResult = await pipeline.run(params, { maxPages });

      // Validate the response
      if (!pipelineResult || !pipelineResult.savedTweets) {
        throw new Error(`${operation} returned invalid result`);
      }

      const tweets = pipelineResult.savedTweets;

      return {
        tweetIds: tweets.map(tweet => tweet.id),
        totalTweets: tweets.length,
        operation,
        metadata,
      };
    } catch (error) {
      console.error(`❌ Twitter scraper tool failed for ${operation}:`, error);
      throw new Error(`Failed to scrape tweets with ${operation}: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});