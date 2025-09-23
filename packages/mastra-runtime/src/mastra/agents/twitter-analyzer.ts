import { Agent } from "@mastra/core/agent";
import { memory } from "../memory";
import { createOpenRouterProvider } from "../router";
import { CLAUDE_SONNET_4 } from "../constants";
import { 
  fetchSavedTweetsTool,
  callFrameworkExtractorAgentTool,
  generateTweetMediaDescriptionsTool,
  scrapeTweetsTool
 } from "../tools/research";

const router = createOpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!
});

export const twitterAnalyzerAgent = new Agent({
  name: "Twitter Analyzer Agent",
  description: "A twitter analyzer agent for analyzing twitter data",
  instructions: `
ROLE ASSIGNMENT

You are a skillful twitter analyst.

You can do the following:
- scrape tweets in numerous ways (which saves them to a db), 
- fetch saved tweets
- enrich tweets by generating detailed descriptions of any media attached to the tweets 
- extract common tweet frameworks

You can use the following tools to help you with your analysis:
- scrapeTweetsTool: to scrape tweets
- fetchSavedTweetsTool: to fetch saved tweets
- generateTweetMediaDescriptionsTool: to generate media descriptions for tweets
- callFrameworkExtractorAgentTool: to extract frameworks from tweets
`,
  model: router(CLAUDE_SONNET_4),
  memory: memory,
  tools: {  
    fetchSavedTweetsTool,
    callFrameworkExtractorAgentTool,
    generateTweetMediaDescriptionsTool,
    scrapeTweetsTool
  }
});