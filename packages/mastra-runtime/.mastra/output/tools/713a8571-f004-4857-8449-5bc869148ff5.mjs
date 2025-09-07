import { createTool } from '@mastra/core';
import { z } from 'zod';
import { listWorkflows } from '@vibeflow/agent-sdk';

const listWorkflowsTool = createTool({
  id: "list-workflows",
  description: "List all workflows",
  inputSchema: z.object({}),
  outputSchema: z.object({
    workflows: z.record(z.string(), z.any())
  }),
  execute: async ({ runtimeContext }) => {
    const workflows = await listWorkflows();
    return { workflows };
  }
});

export { listWorkflowsTool };
