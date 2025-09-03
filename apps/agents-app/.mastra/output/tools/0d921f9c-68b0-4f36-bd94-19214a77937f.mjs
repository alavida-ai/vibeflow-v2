import { createTool } from '@mastra/core';
import { z } from 'zod';
import { s as startWorkflowResultSchema, b as startWorkflow } from '../@brand-listener-agent-sdk.mjs';
import { s as setSession } from '../sessions.mjs';
import '@mastra/client-js';

const startWorkflowTool = createTool({
  id: "start-workflow",
  description: "Start a workflow and return the first suspend payload (first task). Only one workflow can be active per session.",
  inputSchema: z.object({
    workflowId: z.string()
  }),
  outputSchema: startWorkflowResultSchema,
  execute: async ({ context, runtimeContext }, options) => {
    const mcpSid = options?.extra?.sessionId;
    console.log("appSid", mcpSid);
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
      });
      console.log("set session", session);
      return result;
    } catch (error) {
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

export { startWorkflowTool };
//# sourceMappingURL=0d921f9c-68b0-4f36-bd94-19214a77937f.mjs.map
