import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { createMastraInstance } from "./mastra";
import { createVibeflowMCP } from "./mastra/mcp";

// Public factories for apps to consume. No .mastra outputs are imported.

export async function createMastra(options: {
  workflows?: Record<string, Workflow>;
} = {}): Promise<Mastra> {
  const { workflows = {} } = options;
  return await createMastraInstance(workflows);
}

export { createVibeflowMCP };
