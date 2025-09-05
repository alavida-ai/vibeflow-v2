import { Agent } from "@mastra/core/agent";
import { memory } from "../memory";
import { createOpenRouterProvider } from "../router";
import { GPT_4O } from "../constants";

const router = createOpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!
});
 
export const strategyAgent = new Agent({
  name: "Strategy Agent",
  instructions: `You are a strategy agent for a brand. Your job is to ensure that the user's input as well as the research from other agents 
  are effectively achieving the acceptance criteria of a step. 
 
  You will be given the following information:
  - The user's input
  - The research from other agents
  - The acceptance criteria of the step
  `,

  model: router(GPT_4O),
  memory: memory    
});