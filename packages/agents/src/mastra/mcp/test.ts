import { MCPServer } from "@mastra/mcp";
// import { getWorkflowTool } from "../tools/get-workflow";
 
export const notes = new MCPServer({
  name: "test",
  version: "0.1.0",
  tools: {
    // getWorkflowTool,
  },
});