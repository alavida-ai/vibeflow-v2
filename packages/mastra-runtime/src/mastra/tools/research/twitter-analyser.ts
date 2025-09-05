import { createTool } from '@mastra/core/tools';
import { TwitterAnalyser } from '@vibeflow/ingestion';
import { z } from 'zod';
import { AnalyzerService } from '@vibeflow/core';


export const userTweetsScraperTool: ReturnType<typeof createTool> = createTool({
  id: 'user-tweets-scraper',
  description: 'Search for tweets from a user and get info on any media in the tweets',
  inputSchema: z.object({
    userName: z.string().describe('Twitter username to analyze'),
    numTweets: z.number().describe('Number of tweets to analyze'),
  }),
  outputSchema: z.object({
    totalTweets: z.number(),
    username: z.string()
  }),
  execute: async ({ context }) => {
    try {
      // Validate input parameters
      if (!context.userName) {
        throw new Error('userName is required but not provided');
      }
      if (!context.numTweets || context.numTweets <= 0) {
        throw new Error('numTweets must be a positive number');
      }

      console.log(`Scraping recent tweets for user: ${context.userName}, pages: ${Math.ceil(context.numTweets / 20)}`);
      
      const twitterAnalyser = new TwitterAnalyser({
        userName: context.userName,
        maxPages: Math.ceil(context.numTweets / 20)
      });
      const tweetsForOutput = await twitterAnalyser.run();

      // Validate the response
      if (!tweetsForOutput || !tweetsForOutput.ingestionResult) {
        throw new Error('Twitter analysis returned invalid result');
      }

      const totalTweets = tweetsForOutput.ingestionResult.totalTweets ?? 0;
      
      console.log(`✅ Twitter analysis completed. Total tweets: ${totalTweets}`);

      return {
          totalTweets: totalTweets,
          username: context.userName
      };
    } catch (error) {
      console.error('❌ Twitter scraper tool failed:', error);
      throw new Error(`Failed to scrape tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});


export const userTweetsFetcherTool: ReturnType<typeof createTool> = createTool({
  id: 'user-tweets-fetcher',
  description: `Fetch a user\'s tweets data including media descriptions.`,
  inputSchema: z.object({
    userName: z.string().describe('Twitter username to fetch tweets for'),
  }),
  outputSchema: z.object({
    tweets: z.array(z.any())
  }),
  execute: async ({ context }) => {
    try {
      const tweets = await AnalyzerService.getTweetsAnalysisViewByUsername(context.userName);

      return {
        tweets: tweets
      };
    } catch (error) {
      throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});