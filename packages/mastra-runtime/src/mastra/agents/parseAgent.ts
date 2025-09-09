import { Agent } from "@mastra/core/agent";
import { memory } from "../memory";
import { createOpenRouterProvider } from "../router";
import { GPT_4O } from "../constants";

const router = createOpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!
});

export const parseAgent = new Agent({
  name: "Parse Agent",
  instructions: `
You are a data parsing specialist. Your job is to parse raw framework analysis output into structured data.

You will receive raw text output from a framework analysis agent that contains:
- Framework titles and descriptions
- Framework structures/patterns
- Prompts for each framework
- Tweet IDs that each framework was extracted from

Your task is to parse this into a clean JSON structure with the following format:

{
  "frameworks": [
    {
      "title": "Framework Title",
      "description": "Clear description of what this framework does",
      "structure": "Step-by-step structure of the framework",
      "prompt": "The prompt template for using this framework. Please do not summarise this. Keep it as close to the original as possible.",
      "tweetIds": ["tweetId1", "tweetId2", "tweetId3"]
    }
  ]
}

IMPORTANT RULES:
1. Extract ONLY the frameworks that are clearly defined
2. Ensure each framework has ALL required fields (title, description, structure, prompt, tweetIds)
3. The tweetIds array should contain the specific tweet IDs that this framework was extracted from
4. Return ONLY valid JSON, no markdown formatting or additional text
5. If no clear frameworks can be extracted, return {"frameworks": []}
6. Make descriptions concise but informative (1-2 sentences)
7. Structure should be clear step-by-step instructions
8. Prompts should be actionable templates users can follow to use the framework. Please keep these as detailed as possible.

Focus on accuracy and completeness. Only include frameworks that are well-defined and have supporting tweet references.
`,
  model: router(GPT_4O),
  memory: memory,
});
