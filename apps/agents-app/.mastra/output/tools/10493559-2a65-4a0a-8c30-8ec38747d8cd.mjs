import { createTool } from '@mastra/core';
import { z } from 'zod';
import { g as getNextStepResultSchema, b as getNextStep } from '../@brand-listener-agent-sdk.mjs';
import '@mastra/client-js';

const map = /* @__PURE__ */ new Map();
function getAppSessionId(mcpSessionId) {
  try {
    if (!mcpSessionId) return crypto.randomUUID();
    let appSid = map.get(mcpSessionId);
    if (!appSid) {
      throw new Error("No app session id found for mcp session id");
    }
    return appSid;
  } catch (error) {
    throw new Error("No app session id found for mcp session id");
  }
}

const getNextStepTool = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}),
  // No input needed - uses runtime context
  outputSchema: getNextStepResultSchema,
  execute: async ({ runtimeContext }, options) => {
    console.log("options", options);
    try {
      const mcpSid = options?.extra?.sessionId;
      const appSid = getAppSessionId(mcpSid);
      console.log("appSid", appSid);
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
//# sourceMappingURL=10493559-2a65-4a0a-8c30-8ec38747d8cd.mjs.map
