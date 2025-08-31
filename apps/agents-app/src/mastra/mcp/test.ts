import { MCPServer } from "@mastra/mcp";
import { getFilteredTools } from "./client";
import { perplexityAskTool } from "../tools/research/perplexity";
// import { getWorkflowTool } from "../tools/get-workflow";


async function getCompetitiveAnalysisTools() {
  const tools = await getFilteredTools({
      allowedTools: [
          'firecrawlMCP_firecrawl_scrape',
          'firecrawlMCP_firecrawl_map',
          'firecrawlMCP_firecrawl_crawl',
          'firecrawlMCP_firecrawl_check_crawl_status',
          'firecrawlMCP_firecrawl_search',
          'firecrawlMCP_firecrawl_extract',
          'firecrawlMCP_firecrawl_deep_research',
          'firecrawlMCP_firecrawl_generate_llmstxt',
      ]
  });
  
  return {
      ...tools,
      perplexityAskTool,
  };
}

const tools = await getCompetitiveAnalysisTools();
 
export const notes = new MCPServer({
  name: "test",
  version: "0.1.0",
  tools: tools,
});