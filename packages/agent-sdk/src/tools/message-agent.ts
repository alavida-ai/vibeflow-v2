import { VibeflowAgentClient } from "../client";
import { createLogger } from "@vibeflow/logging";

const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";


const logger = createLogger({
    context: "cli",
    name: "agent-sdk"
});


export const messageAgent = async ({
    agentId,
    message,
    threadId
}: {
    agentId: string;
    message: string;
    threadId: string;
}) => {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const agent = mastraClient.getAgent(agentId);
    logger.info("sending message to agent", JSON.stringify(await agent.details(), null, 2) as any);

    const response = await agent.generate({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        memory: {
            resource: "local_test",
            thread: { id: threadId },
          },
      });
    logger.info("Message sent to agent", JSON.stringify(response.text, null, 2) as any);
    return response.text;
}