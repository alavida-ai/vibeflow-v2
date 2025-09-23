import { VibeflowAgentClient } from "../client";
import { createLogger } from "@vibeflow/logging";

const logger = createLogger({
    context: "cli",
    name: "agent-sdk"
});


const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

export const listWorkflows = async () => {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const workflows = await mastraClient.getWorkflows();
    return workflows;
}