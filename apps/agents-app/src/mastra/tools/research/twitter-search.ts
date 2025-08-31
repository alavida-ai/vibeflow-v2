import { createTool } from '@mastra/core/tools';
import { z } from 'zod';


export const twitterSearcherTool = createTool({
  id: 'twitter-searcher',
  description: 'Search for tweets from a user and get info on any media in the tweets',
  inputSchema: z.object({
    userName: z.string().describe('Twitter username to analyze'),
    numTweets: z.number().describe('Number of tweets to analyze'),
  }),
  outputSchema: z.object({
    summary: z.object({
      totalTweets: z.number(),
      totalMediaItems: z.number(),
      mediaWithDescriptions: z.number(),
      username: z.string()
    })
  }),
  execute: async ({ context }) => {
    // Calculate summary statistics
    const totalMediaItems = tweetsForOutput.reduce((count, tweet) => count + (tweet.media?.length || 0), 0);
    const mediaWithDescriptions = tweetsForOutput.reduce((count, tweet) => 
      count + (tweet.media?.filter(m => m.description).length || 0), 0);
    
    return {
      summary: {
        totalTweets: tweetsForOutput.length,
        totalMediaItems,
        mediaWithDescriptions,
        username: context.userName
      }
    };
  },
});