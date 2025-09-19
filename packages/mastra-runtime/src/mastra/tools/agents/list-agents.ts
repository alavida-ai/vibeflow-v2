import { createTool } from "@mastra/core";
import { z } from "zod";
import { listAgentsWithCards } from "@vibeflow/agent-sdk";

export const listAgentsTool: ReturnType<typeof createTool> = createTool({
  id: "list-agents",
  description: "List all agents with their detailed cards using A2A protocol",
  inputSchema: z.object({}), // No input needed
  outputSchema: z.object({
    agents: z.array(z.object({
      id: z.string(),
      card: z.any(),
    }))
  }),
  execute: async ({ runtimeContext }, options) => {
    try {
      // Use the agent-sdk function that handles A2A protocol
      const result = await listAgentsWithCards();
      console.log("result", result);
      return { agents: result };
    } catch (error) {
      console.error("❌ Failed to list agents:", error);
      throw new Error(`Failed to list agents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});