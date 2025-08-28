import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { workflowOrchestrationAgent } from "../agents/workflowOrchestationAgent";
 
type WorkflowContext = {
  threadId: string;
  resourceId: string;
};
 
const initialiseWorkflow = createStep({
  id: "initialise-workflow",
  inputSchema: z.object({}),
  description: "Initialise the workflow",
  outputSchema: z.object({}),
  execute: async ({ runtimeContext }: { runtimeContext: RuntimeContext<WorkflowContext> }) => {
    runtimeContext.set("threadId", "123");
    runtimeContext.set("resourceId", "user_123");
    console.log(`Thread ID: ${runtimeContext.get("threadId")}`);
    return {};
  }
});

const understandCompanyStep = createStep({
  id: "understand-company-step",
  description: "Understand the company",
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
  execute: async ({ resumeData, suspend, runtimeContext }) => {
    const { stepCompleted } = resumeData ?? {};

    const threadId = runtimeContext.get("threadId") as string;
    const resourceId = runtimeContext.get("resourceId") as string;

    console.log("threadId", threadId);
    console.log("resourceId", resourceId);

    const acceptanceCriteria = "Fetch the name of the company, the website, and the industry of the company";
 
    if (!stepCompleted) {
        const prompt = `
        The prompt is:
        Get all the information about the company, including the name of the company, the website, and the industry of the company
    
        The acceptance criteria is:
        ${acceptanceCriteria}
    `;
    const result = await workflowOrchestrationAgent.generate(prompt, {
        memory: {
        thread: {
            id: threadId,
        },
        resource: resourceId
        }
      });

      await suspend({
        agentResponse: result.text,
        stepCompleted: false,
      });
      return { agentResponse: result.text, stepCompleted: false };
    }

    return { stepCompleted: true };
  }
});

const researchStep = createStep({
    id: "research-step",
    description: "Research the company",
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
    execute: async ({ inputData, mastra, resumeData, suspend, runtimeContext }) => {
      const { stepCompleted } = resumeData ?? {};
  
      const threadId = runtimeContext.get("threadId") as string;
      const resourceId = runtimeContext.get("resourceId") as string;
  
      console.log("threadId", threadId);
      console.log("resourceId", resourceId);
  
      const acceptanceCriteria = "Make a research and fetch all the information about the company, including the name of the company, the website, and the industry of the company";
   
      if (!stepCompleted) {
          const prompt = `
          The prompt is:
          Make a research and fetch all the information about the company, including the name of the company, the website, and the industry of the company
      
          The acceptance criteria is:
          ${acceptanceCriteria}
      `;
      const result = await workflowOrchestrationAgent.generate(prompt, {
          memory: {
          thread: {
              id: threadId,
          },
          resource: resourceId
          }
        });
  
        await suspend({
          agentResponse: result.text,
          stepCompleted: false,
        });
        return { stepCompleted: false };
      }
  
      return { stepCompleted: true };
    }
  });
 

 
export const testWorkflow = createWorkflow({
  id: "testWorkflow",
  description: "This is a test workflow",
  inputSchema: z.object({}),
  outputSchema: z.object({
    brandName: z.string(),
    workflowStepOutput: z.string(),
    stepCompleted: z.boolean()
  })
})
  .then(initialiseWorkflow)
  .map(async () => ({})) // Clear output from initialiseWorkflow
  .dountil(understandCompanyStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .map(async () => ({})) // Clear output from understandCompanyStep  
  .dountil(researchStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .commit();
 