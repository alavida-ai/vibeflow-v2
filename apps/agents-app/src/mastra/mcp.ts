import { MCPServer } from "@mastra/mcp";
import { startWorkflowTool } from "./tools/workflows/start-workflow";
import { getNextStepTool } from "./tools/workflows/get-next-step";
import { listWorkflowsTool } from "./tools/workflows/list-workflows";
import { twitterAnalyserTool, twitterSearcherTool } from "./tools/research/twitter-analyser";
import { perplexityAskTool } from "./tools/research/perplexity";
import { getMCPClient } from "./mcp/client";

let serverPromise: Promise<MCPServer> | null = null;

export const getMCPServer = async (): Promise<MCPServer> => {
  if (!serverPromise) {
    serverPromise = (async () =>
      new MCPServer({
        name: "test",
        version: "0.1.0",
        tools: {
          startWorkflowTool,
          getNextStepTool,
          listWorkflowsTool,
          twitterAnalyserTool,
          twitterSearcherTool,
          perplexityAskTool,
          ...(await getMCPClient().getTools()),
        },
      }))();
  }
  return serverPromise;
};