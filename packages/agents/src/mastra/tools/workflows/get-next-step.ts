import { createTool, Tool } from "@mastra/core";
import { z } from "zod";
import { getNextStep } from "./StepOrchestrator";

// @ts-ignore
export const getNextStepTool: Tool = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}), // No input needed - uses runtime context
  outputSchema: z.object({
    stepName: z.string().optional(),
    suspendPayload: z.any().optional(),
    status: z.enum(["success", "suspended", "error"]),
    message: z.string().optional(),
    result: z.any().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await getNextStep();
      
      if (result.status === "suspended") {
        return {
          stepName: result.stepName,
          suspendPayload: result.suspendPayload,
          status: "suspended" as const,
          message: "Next task ready. Complete the task and call get-next-step again to continue."
        };
      } else if (result.status === "success") {
        return {
          status: "success" as const,
          message: "Workflow completed successfully!",
          result: result.result
        };
      } else {
        return {
          status: "error" as const,
          message: result.message || "Workflow failed during resume."
        };
      }
    } catch (error) {
      return {
        status: "error" as const,
        message: `Failed to get next step: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});