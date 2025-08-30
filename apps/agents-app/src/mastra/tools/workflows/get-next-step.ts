import { createTool, Tool } from "@mastra/core";
import { z } from "zod";
import { getNextStep } from "@brand-listener/agent-sdk";

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
  execute: async ({ runtimeContext }) => {
    try {
      const result = await getNextStep({
        runId: runtimeContext.get("current-run-id"),
        workflowId: runtimeContext.get("workflowId")
      });

      if (result.status === "suspended") {
        return result;
      } else if (result.status === "success") {
        runtimeContext.delete("current-run-id");
        runtimeContext.delete("workflowId");
        return result;
      } else {
        runtimeContext.delete("current-run-id");
        runtimeContext.delete("workflowId");
        return result;
      }
    } catch (error) {
      return {
        status: "error" as const,
        message: `Failed to get next step: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});