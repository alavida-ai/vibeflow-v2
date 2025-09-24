import { MCPServer } from "@mastra/mcp";
import { twitterScrapeTool } from "../../tools/research/twitter-scrape";
import { twitterSearchTool } from "../../tools/research/twitter-search";
import { fetchSavedTweetsTool } from "../../tools/research/fetch-saved-tweets";

let serverPromise: Promise<MCPServer> | null = null;

export const createTwitterScraperMCP = async (): Promise<MCPServer> => {
  if (!serverPromise) {
    serverPromise = (async () =>
      new MCPServer({
        name: "twitter-scraper",
        version: "0.1.0",
        tools: {
          twitterScrapeTool,
          twitterSearchTool,
          fetchSavedTweetsTool,
        },
      }))();
  }
  return serverPromise;
};