import { createTool, Tool } from "@mastra/core";
import { z } from "zod";
import { getNextStep, getNextStepResultSchema } from "@brand-listener/agent-sdk";
import { getAppSessionId } from "../../sessionStore";

// @ts-ignore
export const getNextStepTool: Tool = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}), // No input needed - uses runtime context
  outputSchema: getNextStepResultSchema,
  execute: async ({ runtimeContext }, options) => {
    console.log("options", options)
    try {
      // @ts-ignore
      const mcpSid = options?.extra?.sessionId;       // provided by MCP over Hono SSE
      const appSid = getAppSessionId(mcpSid);  
      console.log("appSid", appSid)
      const runId = runtimeContext.get("current-run-id") as string;
      const workflowId = runtimeContext.get("workflowId") as string;

      if (!runId || !workflowId) {
        throw new Error("No runId or workflowId found");
      }

      console.log("runId", runId);
      console.log("workflowId", workflowId);

      const result = await getNextStep({
        runId: runId,
        workflowId: workflowId
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