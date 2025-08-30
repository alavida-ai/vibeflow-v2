import { MCPServer } from "@mastra/mcp";
import { startWorkflowTool } from "./tools/workflows/start-workflow";
import { getNextStepTool } from "./tools/workflows/get-next-step";

export const server = new MCPServer({
  name: "test",
  version: "0.1.0",
  tools: {
    startWorkflowTool,
    getNextStepTool
  },
  
});