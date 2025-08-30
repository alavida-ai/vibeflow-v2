import { createTool } from '@mastra/core';
import { z } from 'zod';
import { g as getNextStep } from '../@brand-listener-agent-sdk.mjs';
import '@mastra/client-js';

const getNextStepTool = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}),
  // No input needed - uses runtime context
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
        status: "error",
        message: `Failed to get next step: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});

export { getNextStepTool };
//# sourceMappingURL=876a304a-9212-41ec-8eda-405d6318ddfc.mjs.map
