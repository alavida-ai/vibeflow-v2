import { VibeflowAgentClient } from "../client";
import { createLogger } from "@vibeflow/logging";


const logger = createLogger({
    context: "cli",
    name: "agent-sdk"
});


import type { AgentCard } from '@a2a-js/sdk';
const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

export const listAgents = async () => {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const agentsResponse = await mastraClient.getAgents();
    logger.info("Agents", JSON.stringify(agentsResponse, null, 2) as any);
    return agentsResponse;
}

export type AgentOverview = {
    id: string;
    card: AgentCard;
}

export const listAgentsWithCards = async (): Promise<AgentOverview[]> => {
    logger.info("🤖 Fetching agents and their cards...");
    
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();

    logger.info("Mastra client", JSON.stringify(mastraClient, null, 2) as any);
    
    // Get list of all agents
    const agentsResponse = await mastraClient.getAgents();
    logger.info("Agents response", JSON.stringify(agentsResponse, null, 2) as any);
    logger.info("📋 Found agents:", JSON.stringify(agentsResponse, null, 2) as any);
    
    const agentCards: AgentOverview[] = [];
    
    
    // Loop through each agent and get their card via A2A protocol
    // The response structure has agents as object keys, not an array
    if (agentsResponse && typeof agentsResponse === 'object') {
        const agentIds = Object.keys(agentsResponse);
        logger.info(`📝 Found ${agentIds.length} agents:`, JSON.stringify(agentIds, null, 2) as any);
        
        for (const agentId of agentIds) {
            const agent = agentsResponse[agentId];
            try {
                logger.info(`🤖 Connecting to agent: ${agentId} via A2A protocol`);
                
                // Get the A2A client for the agent
                const a2aClient = mastraClient.getA2A(agentId);
                
                // Get the agent card to see its capabilities
                logger.info(`📋 Fetching agent card for ${agentId}...`);
                const agentCard = await a2aClient.getCard();
                
                agentCards.push({
                    id: agentId,
                    card: agentCard as AgentCard
                });
                
                logger.info(`✅ Successfully fetched card for ${agentId}`);
                
            } catch (error) {
                throw new Error(`Failed to fetch card for agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
       
            }
        }
    } else {
        logger.info("⚠️ No agents found or unexpected response format");
    }
    
    logger.info(`🎉 Successfully processed ${agentCards.length} agents`);
        return agentCards;
}