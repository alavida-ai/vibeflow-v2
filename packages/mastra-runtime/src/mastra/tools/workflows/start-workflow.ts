import { createTool } from "@mastra/core";
import { z } from "zod";
import { startWorkflow, startWorkflowResultSchema } from "@vibeflow/agent-sdk";
import { setSession } from "../../sessions";
import { createLogger } from "@vibeflow/logging";

export const startWorkflowTool: ReturnType<typeof createTool> = createTool({
  id: "start-workflow",
  description: "Start a workflow and return the first suspend payload (first task). Only one workflow can be active per session.",
  inputSchema: z.object({
    workflowId: z.string()
  }),
  outputSchema: startWorkflowResultSchema,
  execute: async ({ context, runtimeContext, mastra }, options) => {

    const logger = mastra!.getLogger();
    logger.info("workflow info log"); 
    // @ts-ignore
    const mcpSid = options?.extra?.sessionId;       // provided by MCP over Hono SSE
    logger.info("appSid", JSON.stringify(mcpSid, null, 2) as any);
    
    if (!mcpSid) {
      throw new Error("Session ID is required but not provided. Make sure the MCP client is properly configured.");
    }
    
    try {
      const { workflowId } = context;
      
      const result = await startWorkflow(workflowId);
      runtimeContext.set("current-run-id", result.runId);
      runtimeContext.set("workflowId", workflowId);
      logger.info("result and set runId and workflowId", JSON.stringify(result, null, 2) as any);

      if (!result.runId) {
        throw new Error("No runId found from startWorkflow");
      }

      const session = setSession(mcpSid, {
        workflow: {
          runId: result.runId,
          workflowId: context.workflowId
        }
      })

      logger.info("set session", JSON.stringify(session, null, 2) as any);
      return result;
    } catch (error) {
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});