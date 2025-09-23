import { Agent } from "@mastra/core/agent";
import { memory } from "../memory";
import { createOpenRouterProvider } from "../router";
import { GPT_4O } from "../constants";
import { getMCPClient } from "../mcp/client";
import { perplexityAskTool } from "../tools/research/perplexity";
import { userTweetsFetcherTool } from "../tools/research/twitter-analyser";

// Agent types - keeping it simple for now
export interface AgentInput {
  id: string;
  name: string;
  description: string;
  instructions: string;
}

// Default tools available to all dynamic agents
const getDefaultTools = async () => {
  const mcpTools = await getMCPClient().getTools();
  return {
    perplexityAskTool,
    userTweetsFetcherTool,
    ...mcpTools
  };
};

// Default router for agents
const router = createOpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!
});

// Runtime compiler that creates Agent instances from AgentInput specs
export async function compileAgent(spec: AgentInput): Promise<{
  id: string,
  agent: Agent
}> {
  const defaultTools = await getDefaultTools();
  
  const agent = new Agent({
    name: spec.name,
    description: spec.description,
    instructions: spec.instructions,
    model: router(GPT_4O), // Default model for now
    memory: memory,
    tools: defaultTools
  });

  return {
    id: spec.id,
    agent
  };
}

export async function compileAgents(agents: AgentInput[]): Promise<Record<string, {
  id: string,
  agent: Agent
}>> {
  const compiledAgents = await Promise.all(agents.map(compileAgent));
  
  return Object.fromEntries(compiledAgents.map(agent => [agent.id, agent]));
}

// Example usage:
/*
const exampleSpec: AgentInput = {
  id: "content-reviewer",
  name: "Content Reviewer",
  description: "Reviews content for brand consistency and quality",
  instructions: `
    You are a content reviewer focused on brand consistency.
    - Check alignment with brand voice
    - Verify factual accuracy
    - Ensure tone matches target audience
    
    Always provide specific, actionable feedback.
  `
};

const compiledAgent = await compileAgent(exampleSpec);
*/
