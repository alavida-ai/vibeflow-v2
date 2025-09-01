import { createTool } from "@mastra/core";
import { z } from "zod";
import { startWorkflow, StartWorkflowResult, startWorkflowResultSchema } from "@brand-listener/agent-sdk";

export const startWorkflowTool = createTool({
  id: "start-workflow",
  description: "Start a workflow and return the first suspend payload (first task). Only one workflow can be active per session.",
  inputSchema: z.object({
    workflowId: z.string()
  }),
  outputSchema: startWorkflowResultSchema,
  execute: async ({ context, runtimeContext }, options) => {
    // @ts-ignore
    const mcpSid = options?.extra?.sessionId;       // provided by MCP over Hono SSE
    console.log("appSid", mcpSid)
    try {
      const { workflowId } = context;
      
      const result = await startWorkflow(workflowId);
      runtimeContext.set("current-run-id", result.runId);
      runtimeContext.set("workflowId", workflowId);
      console.log("result and set runId and workflowId", result);
      return result;
    } catch (error) {
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});