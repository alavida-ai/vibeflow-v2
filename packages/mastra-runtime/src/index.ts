import { Mastra } from "@mastra/core/mastra";
import { type WorkflowInput } from "@vibeflow/compiler";
import { createMastraInstance } from "./mastra";
import { createVibeflowMCP } from "./mastra/mcp";
import { compileWorkflows } from "./mastra/utils/spec-compiler";

// Public factories for apps to consume. No .mastra outputs are imported.

export async function createMastra(options: {
  workflows?: Record<string, WorkflowInput>;
} = {}): Promise<Mastra> {
  const { workflows = {} } = options;
  const compiledWorkflows = await compileWorkflows(Object.values(workflows));
  console.log('Compiled workflows:', compiledWorkflows);
  return await createMastraInstance(
    { workflows: Object.fromEntries(Object.entries(compiledWorkflows).map(([id, wf]) => [id, wf.workflow])) }
  );
}

export { createVibeflowMCP };
