import { createTool } from "@mastra/core";
import { z } from "zod";
import { startWorkflow } from "@brand-listener/agent-sdk";

export const startWorkflowTool = createTool({
  id: "start-workflow",
  description: "Start a workflow and return the first suspend payload (first task). Only one workflow can be active per session.",
  inputSchema: z.object({
    workflowId: z.string(),
    inputData: z.record(z.any()).optional()
  }),
  outputSchema: z.object({
    runId: z.string().optional(),
    stepName: z.string().optional(),
    suspendPayload: z.any().optional(),
    status: z.enum(["success", "suspended", "error"]),
    message: z.string().optional(),
    result: z.any().optional()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const { workflowId } = context;
      
      const result = await startWorkflow(workflowId);
      runtimeContext.set("current-run-id", result.runId);
      runtimeContext.set("workflowId", workflowId);
      return result;
    } catch (error) {
      return {
        status: "error" as const,
        message: `Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});