import { createTool } from '@mastra/core';
import z from 'zod';
import { l as listWorkflows } from '../@brand-listener-agent-sdk.mjs';
import '@mastra/client-js';

const listWorkflowsTool = createTool({
  id: "list-workflows",
  description: "List all workflows",
  inputSchema: z.object({}),
  outputSchema: z.object({
    workflows: z.record(z.string(), z.any())
  }),
  execute: async ({ runtimeContext }, options) => {
    const workflows = await listWorkflows();
    console.log("Workflows", workflows);
    return { workflows };
  }
});

export { listWorkflowsTool };
//# sourceMappingURL=311ed163-218f-4362-b4d0-0e08fbebdaa9.mjs.map
