import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { RuntimeContext } from "@mastra/core/runtime-context";
 
type WorkflowContext = {
  threadId: string;
  resourceId: string;
};
 
const startStep = createStep({
  id: "start-step",
  description: "Develop a brand strategy for a given brand",
  inputSchema: z.object({
    brandName: z.string()
  }),
  outputSchema: z.object({
    brandName: z.string()
  }),
  execute: async ({ inputData, runtimeContext }: { inputData: { brandName: string }, runtimeContext: RuntimeContext<WorkflowContext> }) => {
    const { brandName } = inputData;
    runtimeContext.set("threadId", "123");
    runtimeContext.set("resourceId", "user_123");
    console.log(`Thread ID: ${runtimeContext.get("threadId")}`);
    return { brandName };
  }
});
 
const strategyStep = createStep({
  id: "strategy-step",
  description: "Develop a brand strategy for a given brand",
  inputSchema: z.object({
    brandName: z.string(),
  }),
  resumeSchema: z.object({
    userMessage: z.string()
  }),
  suspendSchema: z.object({
    suspendResponse: z.string()
  }),
  outputSchema: z.object({
    agentResponse: z.string(),
    stepCompleted: z.boolean()
  }),
  execute: async ({ inputData, mastra, resumeData, suspend, runtimeContext }) => {
    let { brandName } = inputData;
    const { userMessage } = resumeData ?? {};
    let firstMessage = true;

    const threadId = runtimeContext.get("threadId") as string;
    const resourceId = runtimeContext.get("resourceId") as string;

    console.log("threadId", threadId);
    console.log("resourceId", resourceId);

    const acceptanceCriteria = "We have all the information we need to develop a brand strategy for a given brand, including the brand name, the target ICP, and the users website";
 
    if (!userMessage) {
        console.log("No user message, suspending");
        await suspend({
          suspendResponse: "What is the brand name? Do you have a website? Do you have a logo?"
        });
        return { agentResponse: "", stepCompleted: false };
    }
 
    const agent = mastra.getAgent("strategyAgent");
    const response = await agent.generate(
      `
        The user said: "${userMessage}"
        The acceptance criteria of the step is: ${acceptanceCriteria}
        Please respond appropriately.
      `,
      {
        memory: {
            thread: {
                id: threadId,
            },
            resource: resourceId
        },
        output: z.object({
          response: z.string(),
          stepCompleted: z.boolean()
        })
      }
    );
 
    const { response: agentResponse, stepCompleted } = response.object;
 
    return { agentResponse, stepCompleted };
  }
});
 
const winStep = createStep({
  id: "win-step",
  description: "Handle game win logic",
  inputSchema: z.object({
    agentResponse: z.string(),
    stepCompleted: z.boolean()
  }),
  outputSchema: z.object({
    agentResponse: z.string(),
    stepCompleted: z.boolean()
  }),
  execute: async ({ inputData }) => {
    const { agentResponse, stepCompleted } = inputData;
 
    return { agentResponse, stepCompleted };
  }
});
 
export const strategyWorkflow = createWorkflow({
  id: "strategy-workflow",
  inputSchema: z.object({
    brandName: z.string()
  }),
  outputSchema: z.object({
    brandName: z.string(),
    workflowStepOutput: z.string(),
    stepCompleted: z.boolean()
  })
})
  .then(startStep)
  .dountil(strategyStep, async ({ inputData: { stepCompleted } }) => stepCompleted)
  .then(winStep)
  .commit();
 