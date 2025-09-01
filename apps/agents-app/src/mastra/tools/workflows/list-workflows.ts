import { createTool } from "@mastra/core";
import z from "zod";
import { listWorkflows } from "@brand-listener/agent-sdk";

export const listWorkflowsTool = createTool({
  id: "list-workflows",
  description: "List all workflows",
  inputSchema: z.object({}),
  outputSchema: z.object({
    workflows: z.record(z.string(), z.any())
  }),
  execute: async ({ runtimeContext }, options) => {
    const workflows = await listWorkflows();
    console.log("Workflows", workflows);
    return { workflows };
  }
});