import { createTool } from '@mastra/core';
import { z } from 'zod';
import { g as getNextStepResultSchema, a as getNextStep } from '../@brand-listener-agent-sdk.mjs';
import { g as getSession, d as deleteSession } from '../sessions.mjs';
import '@mastra/client-js';

const getNextStepTool = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}),
  // No input needed - uses runtime context
  outputSchema: getNextStepResultSchema,
  execute: async ({ runtimeContext }, options) => {
    console.log("options", options);
    const mcpSid = options?.extra?.sessionId;
    console.log("appSid", mcpSid);
    if (!mcpSid) {
      throw new Error("Session ID is required but not provided. Make sure the MCP client is properly configured.");
    }
    const session = getSession(mcpSid);
    try {
      const runId = session?.workflow?.runId;
      const workflowId = session?.workflow?.workflowId;
      if (!runId || !workflowId) {
        throw new Error("No runId or workflowId found from session");
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
        deleteSession(mcpSid);
        return result;
      } else {
        deleteSession(mcpSid);
        return result;
      }
    } catch (error) {
      console.error("Failed to get next step", error);
      throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

export { getNextStepTool };
//# sourceMappingURL=990164bf-c870-4f8e-a587-bd2d6bd75f55.mjs.map
