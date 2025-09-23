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
  execute: async ({ context, mastra }, options) => {
    try {
        const { agentId, message, threadId } = context;
        const logger = mastra!.getLogger();
      // Use the agent-sdk function that handles A2A protocol

      logger.info("sending message to agent", JSON.stringify({ agentId, message, threadId }, null, 2) as any);
      const result = await messageAgent({ agentId, message, threadId });
      logger.info("result", JSON.stringify(result, null, 2) as any);
      return { message: result, agentId, threadId };
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});