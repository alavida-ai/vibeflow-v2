import { createTool } from '@mastra/core';
import { z } from 'zod';
import { s as startWorkflowResultSchema, b as startWorkflow } from '../@brand-listener-agent-sdk.mjs';
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
    try {
      const { workflowId } = context;
      const result = await startWorkflow(workflowId);
      runtimeContext.set("current-run-id", result.runId);
      runtimeContext.set("workflowId", workflowId);
      console.log("result and set runId and workflowId", result);
      return result;
    } catch (error) {
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

export { startWorkflowTool };
//# sourceMappingURL=3055e1f4-d744-421f-9e5c-cf8b316919db.mjs.map
