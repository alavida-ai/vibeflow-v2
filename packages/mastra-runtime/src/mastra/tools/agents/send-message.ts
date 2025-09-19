import { createTool } from "@mastra/core";
import { z } from "zod";
import { messageAgent } from "@vibeflow/agent-sdk";


export const sendMessageTool: ReturnType<typeof createTool> = createTool({
  id: "send-message",
  description: "Send a message to an agent",
  inputSchema: z.object({
    message: z.string(),
    agentId: z.string(),
    threadId: z.string(),
  }),
  outputSchema: z.object({
    message: z.string(),
    agentId: z.string(),
    threadId: z.string(),
  }),
  execute: async ({ context }, options) => {
    try {
        const { agentId, message, threadId } = context;
      // Use the agent-sdk function that handles A2A protocol

      console.log("sending message to agent", agentId, message, threadId);
      const result = await messageAgent({ agentId, message, threadId });
      console.log("result", result);
      return { message: result, agentId, threadId };
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});