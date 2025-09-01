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
//# sourceMappingURL=03a7e9c2-8adc-4914-ae36-09b6ab4dc7ec.mjs.map
