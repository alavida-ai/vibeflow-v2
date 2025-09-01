import { VibeflowAgentClient } from "../client";

const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

export const listWorkflows = async () => {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const workflows = await mastraClient.getWorkflows();
    console.log("Workflows", workflows);
    return workflows;
}