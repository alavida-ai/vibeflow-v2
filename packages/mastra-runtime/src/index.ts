import { Mastra } from "@mastra/core/mastra";
import { type WorkflowInput, type AgentInput } from "@vibeflow/compiler";
import { createMastraInstance } from "./mastra";
import { createVibeflowMCP } from "./mastra/mcp";
import { compileWorkflows } from "./mastra/utils/spec-compiler";
import { compileAgents } from "./mastra/utils/agent-compiler";

// Public factories for apps to consume. No .mastra outputs are imported.

export async function createMastra(options: {
  workflows?: Record<string, WorkflowInput>;
  agents?: Record<string, AgentInput>;
} = {}): Promise<Mastra> {
  const { workflows = {}, agents = {} } = options;
  
  const compiledWorkflows = await compileWorkflows(Object.values(workflows));
  
  const compiledAgents = await compileAgents(Object.values(agents));
  
  return await createMastraInstance({
    workflows: Object.fromEntries(Object.entries(compiledWorkflows).map(([id, wf]) => [id, wf.workflow])),
    agents: Object.fromEntries(Object.entries(compiledAgents).map(([id, ag]) => [id, ag.agent]))
  });
}

export { createVibeflowMCP };
