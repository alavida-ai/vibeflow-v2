import { VibeflowAgentClient } from "../client";

import type { AgentCard } from '@a2a-js/sdk';
const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

export const listAgents = async () => {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const agentsResponse = await mastraClient.getAgents();
    console.log("Agents", agentsResponse);
    return agentsResponse;
}

export type AgentOverview = {
    id: string;
    card: AgentCard;
}

export const listAgentsWithCards = async (): Promise<AgentOverview[]> => {
    console.log("🤖 Fetching agents and their cards...");
    
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();

    console.log("Mastra client", mastraClient);
    
    // Get list of all agents
    const agentsResponse = await mastraClient.getAgents();
    console.log("Agents response", agentsResponse);
    console.log("📋 Found agents:", agentsResponse);
    
    const agentCards: AgentOverview[] = [];
    
    
    // Loop through each agent and get their card via A2A protocol
    // The response structure has agents as object keys, not an array
    if (agentsResponse && typeof agentsResponse === 'object') {
        const agentIds = Object.keys(agentsResponse);
        console.log(`📝 Found ${agentIds.length} agents:`, agentIds);
        
        for (const agentId of agentIds) {
            const agent = agentsResponse[agentId];
            try {
                console.log(`🤖 Connecting to agent: ${agentId} via A2A protocol`);
                
                // Get the A2A client for the agent
                const a2aClient = mastraClient.getA2A(agentId);
                
                // Get the agent card to see its capabilities
                console.log(`📋 Fetching agent card for ${agentId}...`);
                const agentCard = await a2aClient.getCard();
                
                agentCards.push({
                    id: agentId,
                    card: agentCard as AgentCard
                });
                
                console.log(`✅ Successfully fetched card for ${agentId}`);
                
            } catch (error) {
                throw new Error(`Failed to fetch card for agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
       
            }
        }
    } else {
        console.log("⚠️ No agents found or unexpected response format");
    }
    
    console.log(`🎉 Successfully processed ${agentCards.length} agents`);
        return agentCards;
}