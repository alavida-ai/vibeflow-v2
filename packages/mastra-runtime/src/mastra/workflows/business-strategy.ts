import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { workflowOrchestrationAgent } from "../agents/workflowOrchestationAgent";

const foundationResearchStep = createStep({
  id: "foundation-research-step",
  description: "Foundation research",
  inputSchema: z.object({}),
  resumeSchema: z.object({
    stepCompleted: z.boolean()
  }),
  suspendSchema: z.object({
    agentResponse: z.string(),
    stepCompleted: z.boolean()
  }),
  outputSchema: z.object({
    stepCompleted: z.boolean()
  }),
  execute: async ({ resumeData, suspend }) => {
    try {
    const { stepCompleted } = resumeData ?? {};

    const promptInstructions = `Your job is to collaborate with the user and help him develop his brand strategy by creating brand analysis, 
    tone of voice, target audience, and other strategic documents. Use the firecrawl mcp to scrape @[your-website-url] you want to understand their services, who they serve, 
    key competitors in their local market as well as other competitors they could be competing against. If you do not have all the information you need, ask the user for more information.`;

    const acceptanceCriteria = `You have all the information you need from the user and scraping his website that sets up the basis for further steps.
    You can confidently understand the user's brand, his target audience, and his brand positioning.
    `;
 
    if (!stepCompleted) {
        const prompt = `
        The prompt is:
        ${promptInstructions}
    
        The acceptance criteria is:
        ${acceptanceCriteria}
    `;
    const result = await workflowOrchestrationAgent.generate(prompt);

      await suspend({
        agentResponse: result.text,
        stepCompleted: false,
      });
      return { agentResponse: result.text, stepCompleted: false };
    }

    return { stepCompleted: true };
  } catch (error) {
    console.error("Error in understandCompanyStep", error);
    return { stepCompleted: false };
  }
  }
});

const digitalPresenceAuditStep = createStep({
    id: "digital-presence-audit-step",
    description: "Digital presence audit",
    inputSchema: z.object({}),
    resumeSchema: z.object({
      stepCompleted: z.boolean()
    }),
    suspendSchema: z.object({
      agentResponse: z.string(),
      stepCompleted: z.boolean()
    }),
    outputSchema: z.object({
      stepCompleted: z.boolean()
    }),
    execute: async ({ resumeData, suspend }) => {
      try {
      const { stepCompleted } = resumeData ?? {};
  
     const promptInstructions = `Okay, now analyse the user's companies online presence including: 1) website design, UX and content strategy 2) Social media presence on Instagram, Facebook, Linkedin, Youtube, Twitter/X 3) SEO performance and search visibility 4) Content marketing efforts (blog, resources) 5) online reviews and reputation management. 
     You can first ask the user what platforms he is currently marketing on and then use the firecrawl mcp to scrape the information or if it's X you have to use the twitter mcp to scrape his tweets and understand his current brand positioning.`
  
      const acceptanceCriteria = "You have a solid understanding of the user's current brand presence, as well as his following, and which platforms he is currently marketing on.";
   
      if (!stepCompleted) {
          const prompt = `
          The prompt is:
          ${promptInstructions}
      
          The acceptance criteria is:
          ${acceptanceCriteria}
      `;
      const result = await workflowOrchestrationAgent.generate(prompt);
  
        await suspend({
          agentResponse: result.text,
          stepCompleted: false,
        });
        return { stepCompleted: false };
      }
  
      return { stepCompleted: true };
    } catch (error) {
      console.error("Error in researchStep", error);
      return { stepCompleted: false };
    }
    }
  });
  
  const marketDynamicsAnalysisStep = createStep({
    id: "market-dynamics-analysis-step",
    description: "Market dynamics analysis",
    inputSchema: z.object({}),
    resumeSchema: z.object({
      stepCompleted: z.boolean()
    }),
    suspendSchema: z.object({
      agentResponse: z.string(),
      stepCompleted: z.boolean()
    }),
    outputSchema: z.object({
      stepCompleted: z.boolean()
    }),
    execute: async ({ resumeData, suspend }) => {
      try {
      const { stepCompleted } = resumeData ?? {};
  
     const promptInstructions = `You should look identify the niche that the user is in, and use the perplexity MCP to research the current market trends and opportunities and challenges in this niche.
     You should also identify the user's competitors and their market share. This will inform the user's brand positioning, use the research to inform the user's brand strategy. Collaborate closely with the user, highlight research with him
     and ensure he is happy with the research you have peformed and the implications for his brand strategy.`;
  
      const acceptanceCriteria = "You and the user have a solid understanding of the user's niche, the current market trends, and the opportunities and challenges in this niche. And are completely aligned on the user's brand strategy.";
   
      if (!stepCompleted) {
          const prompt = `
          The prompt is:
          ${promptInstructions}
      
          The acceptance criteria is:
          ${acceptanceCriteria}
      `;
      const result = await workflowOrchestrationAgent.generate(prompt);
  
        await suspend({
          agentResponse: result.text,
          stepCompleted: false,
        });
        return { stepCompleted: false };
      }
  
      return { stepCompleted: true };
    } catch (error) {
      console.error("Error in researchStep", error);
      return { stepCompleted: false };
    }
    }
  });
 

  const strategyDocumentCreationStep = createStep({
    id: "strategy-document-creation-step",
    description: "Strategy document creation",
    inputSchema: z.object({}),
    resumeSchema: z.object({
      stepCompleted: z.boolean()
    }),
    suspendSchema: z.object({
      agentResponse: z.string(),
      stepCompleted: z.boolean()
    }),
    outputSchema: z.object({
      stepCompleted: z.boolean()
    }),
    execute: async ({ resumeData, suspend }) => {
      try {
      const { stepCompleted } = resumeData ?? {};
  
     const promptInstructions = `Condense all the information that you have on the user's company and its competitors into three separate reports: A target audience report, Tone of Voice, and Brand fundamentals Analysis. Put it in the strategy folder as markdown files.`;
  
      const acceptanceCriteria = "Documents are comprehensive and serve as a foundation for future communications and content creation. Ensure the user is happy with the documents and has approved them.";
   
      if (!stepCompleted) {
          const prompt = `
          The prompt is:
          ${promptInstructions}
      
          The acceptance criteria is:
          ${acceptanceCriteria}
      `;
      const result = await workflowOrchestrationAgent.generate(prompt);
  
        await suspend({
          agentResponse: result.text,
          stepCompleted: false,
        });
        return { stepCompleted: false };
      }
  
      return { stepCompleted: true };
    } catch (error) {
      console.error("Error in researchStep", error);
      return { stepCompleted: false };
    }
    }
  });

  
export const businessStrategyWorkflow = createWorkflow({
  id: "business-strategy-workflow",
  description: "This is a business strategy workflow",
  inputSchema: z.object({}),
  outputSchema: z.object({
    brandName: z.string(),
    workflowStepOutput: z.string(),
    stepCompleted: z.boolean()
  })
})
  .dountil(foundationResearchStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .map(async () => ({})) // Clear output from initialiseWorkflow
  .dountil(digitalPresenceAuditStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .map(async () => ({})) // Clear output from digitalPresenceAuditStep  
  .dountil(marketDynamicsAnalysisStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .map(async () => ({})) // Clear output from marketDynamicsAnalysisStep  
  .dountil(strategyDocumentCreationStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .map(async () => ({})) // Clear output from strategyDocumentCreationStep  
  .commit();
 