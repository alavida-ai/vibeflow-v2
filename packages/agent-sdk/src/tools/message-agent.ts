import { VibeflowAgentClient } from "../client";

const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

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
    console.log("sending message to agent", await agent.details());

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
    console.log("Message sent to agent", response.text);
    return response.text;
}