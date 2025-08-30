import { MastraClient } from "@mastra/client-js";


export class VibeflowAgentClient {

    baseUrl: string;

    constructor(baseUrl: string) {
        if (!baseUrl) {
            throw new Error("Base URL is required");
        }

        this.baseUrl = baseUrl;
    }

    async createMastraClient() {
        return new MastraClient({
            baseUrl: this.baseUrl,
        });
    }

    async createMastraAgent(agentName: string): Promise<any> {
        if (!agentName) {
            throw new Error("Agent name is required");
        }

        const mastraClient = await this.createMastraClient();

        const agent = mastraClient.getAgent(agentName);

        if (!agent) {
            throw new Error("Agent not found");
        }
        return agent;
    }
}