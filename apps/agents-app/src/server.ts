import { MCPServer } from "@mastra/mcp";
import { startWorkflowTool, getNextStepTool } from "@brand-listener/agents";

export const server = new MCPServer({
  name: "test",
  version: "0.1.0",
  tools: {
    startWorkflowTool,
    getNextStepTool
  },
});