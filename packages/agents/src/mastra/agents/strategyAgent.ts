import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLVector } from "@mastra/libsql";
import { memory } from "../memory";


 
export const strategyAgent = new Agent({
  name: "Strategy Agent",
  instructions: `You are a strategy agent for a brand. Your job is to ensure that the user's input as well as the research from other agents 
  are effectively achieving the acceptance criteria of a step. 

  You will be given the following information:
  - The user's input
  - The research from other agents
  - The acceptance criteria of the step
  `,
  model: openai("gpt-4o-mini"),
  memory: memory    
});