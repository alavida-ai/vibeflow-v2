import { createTool } from '@mastra/core/tools';
import { TwitterAnalyser } from '@brand-listener/ingestion/tools';
import { z } from 'zod';


export const twitterSearcherTool = createTool({
  id: 'twitter-scraper',
  description: 'Search for tweets from a user and get info on any media in the tweets',
  inputSchema: z.object({
    userName: z.string().describe('Twitter username to analyze'),
    numTweets: z.number().describe('Number of tweets to analyze'),
  }),
  outputSchema: z.object({
    summary: z.object({
      username: z.string()
    })
  }),
  execute: async ({ context }) => {
    try {
      const twitterAnalyser = new TwitterAnalyser({
        userName: context.userName,
        maxPages: context.numTweets / 20
      });
      const tweetsForOutput = await twitterAnalyser.run();

      return {
        summary: {
          totalTweets: tweetsForOutput.ingestionResult.totalTweets,
          username: context.userName
        }
      };
    } catch (error) {
      throw new Error(`Failed to scrape tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});