import { createTool } from '@mastra/core';
import { z } from 'zod';
import { g as getNextStepResultSchema, a as getNextStep } from '../@brand-listener-agent-sdk.mjs';
import '@mastra/client-js';

const getNextStepTool = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}),
  // No input needed - uses runtime context
  outputSchema: getNextStepResultSchema,
  execute: async ({ runtimeContext }) => {
    try {
      const runId = runtimeContext.get("current-run-id");
      const workflowId = runtimeContext.get("workflowId");
      if (!runId || !workflowId) {
        throw new Error("No runId or workflowId found");
      }
      console.log("runId", runId);
      console.log("workflowId", workflowId);
      const result = await getNextStep({
        runId,
        workflowId
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
      console.error("Failed to get next step", error);
      throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

export { getNextStepTool };
//# sourceMappingURL=4d0489ef-b828-42ad-a2cf-0a3496d26027.mjs.map
