import { createTool } from "@mastra/core";
import { z } from "zod";
import { startWorkflow, startWorkflowResultSchema } from "@vibeflow/agent-sdk";
import { setSession } from "../../sessions";

export const startWorkflowTool: ReturnType<typeof createTool> = createTool({
  id: "start-workflow",
  description: "Start a workflow and return the first suspend payload (first task). Only one workflow can be active per session.",
  inputSchema: z.object({
    workflowId: z.string()
  }),
  outputSchema: startWorkflowResultSchema,
  execute: async ({ context, runtimeContext, mastra }, options) => {

    console.log("mastra", mastra);
    // @ts-ignore
    const mcpSid = options?.extra?.sessionId;       // provided by MCP over Hono SSE
    console.log("appSid", mcpSid)
    
    if (!mcpSid) {
      throw new Error("Session ID is required but not provided. Make sure the MCP client is properly configured.");
    }
    
    try {
      const { workflowId } = context;
      
      const result = await startWorkflow(workflowId);
      runtimeContext.set("current-run-id", result.runId);
      runtimeContext.set("workflowId", workflowId);
      console.log("result and set runId and workflowId", result);

      if (!result.runId) {
        throw new Error("No runId found from startWorkflow");
      }

      const session = setSession(mcpSid, {
        workflow: {
          runId: result.runId,
          workflowId: context.workflowId
        }
      })

      console.log("set session", session);
      return result;
    } catch (error) {
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});