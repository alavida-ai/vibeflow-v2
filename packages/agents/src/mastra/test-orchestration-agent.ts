import dotenv from "dotenv";
dotenv.config({path: "/Users/alexandergirardet/Code/vibeflow-projects/brand-listener/packages/agents/.env"});

import { workflowOrchestrationAgent } from "./agents/workflowOrchestationAgent";



const prompt = `
    The prompt is:
    "Use the perplexity mcp to research @[your-website-url] I want to understand their services, who they serve, key competitors in their local market as well as other competitors they could be competing against, identify other market leaders in their niche"

    The input is:
    "@[your-website-url]"

    The deliverables are:
    "2-3 pages of detailed analysis covering business model, target customers, and competitive environment."

    The tools are:
    "Perplexity MCP"

    The acceptance criteria is:
    "Output is consistent with desired target audience. Suggest tweaks or further research if necessary."
`;
const result = await workflowOrchestrationAgent.generate(prompt);

console.log(result.text);