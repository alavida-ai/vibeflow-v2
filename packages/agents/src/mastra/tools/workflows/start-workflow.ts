import { createTool, Tool } from "@mastra/core";
import { z } from "zod";
import { startWorkflow } from "./StepOrchestrator";

export const startWorkflowTool: Tool = createTool({
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
  execute: async ({ context }) => {
    try {
      const { workflowId, inputData: workflowInput = { start: true } } = context;
      
      const result = await startWorkflow(workflowId, workflowInput);
      
      if (result.status === "suspended") {
        return {
          runId: result.runId,
          stepName: result.stepName,
          suspendPayload: result.suspendPayload,
          status: "suspended" as const,
          message: "Workflow suspended. Complete the task and call get-next-step to continue."
        };
      } else if (result.status === "success") {
        return {
          runId: result.runId,
          status: "success" as const,
          message: "Workflow completed successfully.",
          result: result.result
        };
      } else {
        return {
          runId: result.runId,
          status: "error" as const, 
          message: result.message || "Workflow failed or returned unexpected status."
        };
      }
    } catch (error) {
      return {
        status: "error" as const,
        message: `Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});