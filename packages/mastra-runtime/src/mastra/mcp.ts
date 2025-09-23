import { MCPServer } from "@mastra/mcp";
import { startWorkflowTool } from "./tools/workflows/start-workflow";
import { getNextStepTool } from "./tools/workflows/get-next-step";
import { listWorkflowsTool } from "./tools/workflows/list-workflows";
import { listAgentsTool } from "./tools/agents/list-agents";
import { sendMessageTool } from "./tools/agents/send-message";

let serverPromise: Promise<MCPServer> | null = null;

export const createVibeflowMCP = async (): Promise<MCPServer> => {
  if (!serverPromise) {
    serverPromise = (async () =>
      new MCPServer({
        name: "vibeflow",
        version: "0.1.0",
        tools: {
          startWorkflowTool,
          getNextStepTool,
          listWorkflowsTool,
          listAgentsTool,
          sendMessageTool,
        },
      }))();
  }
  return serverPromise;
};