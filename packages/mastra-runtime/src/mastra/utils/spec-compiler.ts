import { createStep, createWorkflow, Workflow } from "@mastra/core/workflows";
import { z } from "zod";
import { workflowOrchestrationAgent } from "../agents/workflowOrchestationAgent";

// JSON Spec Interfaces
export interface WorkflowSpec {
  id: string;
  description: string;
  steps: StepSpec[];
}

export interface StepSpec {
  id: string;
  description: string;
  promptInstructions: string;
  acceptanceCriteria: string;
}

// Runtime compiler that follows the suspend/resume + dountil pattern
export function compileWorkflow(spec: WorkflowSpec, mastra: any) : Workflow {
  // Create steps following the exact pattern from business-strategy.ts
  const compiledSteps = spec.steps.map(stepSpec => 
    createStep({
      id: stepSpec.id,
      description: stepSpec.description,
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

          if (!stepCompleted) {
            const prompt = `
            The prompt is:
            ${stepSpec.promptInstructions}
        
            The acceptance criteria is:
            ${stepSpec.acceptanceCriteria}
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
          console.error(`Error in ${stepSpec.id}`, error);
          return { stepCompleted: false };
        }
      }
    })
  );

  // Create workflow following the dountil + map pattern
  let workflow = createWorkflow({
    id: spec.id,
    description: spec.description,
    inputSchema: z.object({}),
    outputSchema: z.object({
      stepCompleted: z.boolean()
    }),
    mastra
  });

  // Chain each step with dountil + map pattern
  compiledSteps.forEach(step => {
    workflow = workflow
      .dountil(step, async ({ inputData: { stepCompleted } }) => stepCompleted)
      .map(async () => ({})); // Clear output after each step
  });
  
  workflow.commit();

  return workflow;
}

// Example usage:
/*
const exampleSpec: WorkflowSpec = {
  id: "custom-strategy-workflow",
  description: "A custom strategy workflow from JSON",
  steps: [
    {
      id: "research-step",
      description: "Research the market",
      promptInstructions: "Research the market for the user's business and understand their competitive landscape.",
      acceptanceCriteria: "You have a comprehensive understanding of the market and competitors."
    },
    {
      id: "analysis-step", 
      description: "Analyze findings",
      promptInstructions: "Analyze the research findings and identify key opportunities and threats.",
      acceptanceCriteria: "Analysis is complete with clear opportunities and threats identified."
    }
  ]
};

const compiledWorkflow = compileWorkflow(exampleSpec);
*/