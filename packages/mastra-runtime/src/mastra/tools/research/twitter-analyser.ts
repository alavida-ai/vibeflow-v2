import { createTool, Tool } from '@mastra/core/tools';
import { TwitterAnalyser } from '@vibeflow/ingestion';
import { z } from 'zod';
import { AnalyzerService } from '@vibeflow/core';

// @ts-ignore
export const twitterSearcherTool : Tool = createTool({
  id: 'twitter-scraper',
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

      console.log(`🔍 Starting Twitter analysis for user: ${context.userName}, pages: ${Math.ceil(context.numTweets / 20)}`);
      
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


// @ts-ignore
export const twitterAnalyserTool: Tool = createTool({
  id: 'twitter-analyser',
  description: `Analyze a user\'s tweets and get info on any media in the tweets. You need to write a SQL query to get the tweets to analyze. A username will be provided to analyze the tweets. If this returns empty it means we have not scraped the tweets yet. So you to use the twitter scraper tool to scrape the tweets.
      SELECT 
      t.id,
      t.api_id,
      t.url as tweet_url,
      t.text,
      t.username,
      t.evs,
      t.created_at,
      t.retweet_count,
      t.reply_count,
      t.like_count,
      t.quote_count,
      t.view_count,
      m.url as media_url,
      m.type as media_type,
      m.description as media_description
    FROM tweets_analyzer t
    INNER JOIN tweet_media_analyzer m ON t.id = m.tweet_id
    WHERE m.type IN ('photo', 'video')
    AND t.username = 'alexgirardet'
    ORDER BY t.evs desc
    LIMIT 10;
  `,
  inputSchema: z.object({
    sql: z.string().describe('SQL query to get tweets to analyze'),
  }),
  outputSchema: z.object({
    tweets: z.array(z.any())
  }),
  execute: async ({ context }) => {
    try {
      const tweets = await AnalyzerService.getTweetsBySql(context.sql);

      return {
        tweets: tweets
      };
    } catch (error) {
      throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});