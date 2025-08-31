import { TwitterAnalyser } from '@brand-listener/ingestion/tools';
import { c as createTool, z } from '../mastra.mjs';
import 'stream/web';
import 'crypto';
import 'events';
import 'node:crypto';
import 'path';
import 'util';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'url';
import 'node:process';
import 'pg';
import 'os';
import 'fs';

const twitterSearcherTool = createTool({
  id: "twitter-scraper",
  description: "Search for tweets from a user and get info on any media in the tweets",
  inputSchema: z.object({
    userName: z.string().describe("Twitter username to analyze"),
    numTweets: z.number().describe("Number of tweets to analyze")
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
  }
});

export { twitterSearcherTool };
//# sourceMappingURL=13e2e1bf-b84e-421b-b354-b8781623dff4.mjs.map
