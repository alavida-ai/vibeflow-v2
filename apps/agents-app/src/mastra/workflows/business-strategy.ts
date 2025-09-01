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

    const promptInstructions = `Use the perplexity mcp to research @[your-website-url] I want to understand their services, who they serve, key competitors in their local market as well as other competitors they could be competing against, identify other market leaders in their niche`;

    const acceptanceCriteria = "Output is consistent with desired target audience. Suggest tweaks or further research if necessary.";
 
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
  
     const promptInstructions = `Okay, now analyse [Your Company Name]'s online presence including: 1) website design, UX and content strategy 2) Social media presence on Instagram, Facebook, Linkedin, Youtube, Twitter/X 3) SEO performance and search visibility 4) Content marketing efforts (blog, resources) 5) online reviews and reputation management. Use firecrawl mcp and perplexity mcp to research`;
  
      const acceptanceCriteria = "Audit highlights strengths and weaknesses with specific improvement opportunities identified.";
   
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
  
     const promptInstructions = `What are the current market trends in [your specific industry]? What opportunities and challenges does [Your Company Name] face in competing with both local competitions and national online platforms?`;
  
      const acceptanceCriteria = "Analysis clearly identifies industry trends, growth opportunities, and competitive challenges.";
   
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
    id: "digital-presence-audit-step",
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
  
     const promptInstructions = `Condense all the information that you have on [Your Company Name] and its competitors into three separate reports: A target audience report, Tone of Voice, and Brand Analysis.`;
  
      const acceptanceCriteria = "Documents are comprehensive and serve as a foundation for future communications and content creation.";
   
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
 