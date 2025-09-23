import { createTool } from "@mastra/core";
import { z } from "zod";
import { getNextStep, getNextStepResultSchema } from "@vibeflow/agent-sdk";
import { deleteSession, getSession } from "../../sessions";

export const getNextStepTool: ReturnType<typeof createTool> = createTool({
  id: "get-next-step",
  description: "Resume the current workflow by marking the previous step as completed and return the next suspend payload (next task). Requires an active workflow started with start-workflow.",
  inputSchema: z.object({}), // No input needed - uses runtime context
  outputSchema: getNextStepResultSchema,
  execute: async ({ runtimeContext, mastra }, options) => {
    const logger = mastra!.getLogger();
    logger.info("options", JSON.stringify(options, null, 2) as any);

    // @ts-ignore
    const mcpSid = options?.extra?.sessionId;       // provided by MCP over Hono SSE
    logger.info("appSid", JSON.stringify(mcpSid, null, 2) as any);
    
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

      logger.info("runId", JSON.stringify(runId, null, 2) as any);
      logger.info("workflowId", JSON.stringify(workflowId, null, 2) as any);

      const result = await getNextStep({
        runId: runId,
        workflowId: workflowId
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
      logger.error("Failed to get next step", JSON.stringify(error, null, 2) as any);
      throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});