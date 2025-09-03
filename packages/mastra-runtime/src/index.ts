import { mastra } from "./mastra";
import { createMCPServer } from "./mastra/mcp";

// Public factories for apps to consume. No .mastra outputs are imported.

export function createMastra() {
  return mastra;
}

export { createMCPServer };
