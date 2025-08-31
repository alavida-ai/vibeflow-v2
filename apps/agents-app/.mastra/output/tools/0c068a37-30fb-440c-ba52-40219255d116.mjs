import { createTool } from '@mastra/core';
import { z } from 'zod';
import { s as startWorkflowResultSchema, a as startWorkflow } from '../@brand-listener-agent-sdk.mjs';
import '@mastra/client-js';

const startWorkflowTool = createTool({
  id: "start-workflow",
  description: "Start a workflow and return the first suspend payload (first task). Only one workflow can be active per session.",
  inputSchema: z.object({
    workflowId: z.string()
  }),
  outputSchema: startWorkflowResultSchema,
  execute: async ({ context, runtimeContext }) => {
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
//# sourceMappingURL=0c068a37-30fb-440c-ba52-40219255d116.mjs.map
