import { createStep, createWorkflow, Workflow } from "@mastra/core/workflows";
import { z } from "zod";
import { workflowOrchestrationAgent } from "../agents/workflowOrchestationAgent";
import type { WorkflowInput, StepInput } from "@vibeflow/compiler";

// Runtime compiler that follows the suspend/resume + dountil pattern
export function compileWorkflow(spec: WorkflowInput) : {
  id: string,
  workflow: Workflow
} {
  // Create steps following the exact pattern from business-strategy.ts
  const compiledSteps = spec.steps.map(stepSpec => 
    createStep({
      id: stepSpec.id,
      description: stepSpec.description ?? stepSpec.id,
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
            // Handle acceptance_criteria as string or array
            const acceptanceCriteria = Array.isArray(stepSpec.acceptance_criteria) 
              ? stepSpec.acceptance_criteria.join('\n') 
              : (stepSpec.acceptance_criteria ?? 'Step completed successfully');

            const prompt = `
            The prompt is:
            ${stepSpec.prompt}
        
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
          console.error(`Error in ${stepSpec.id}`, error);
          return { stepCompleted: false };
        }
      }
    })
  );

  // Create workflow following the dountil + map pattern
  let workflow = createWorkflow({
    id: spec.id,
    description: spec.description ?? spec.id,
    inputSchema: z.object({}),
    outputSchema: z.object({
      brandName: z.string(),
      workflowStepOutput: z.string(), 
      stepCompleted: z.boolean()
    })
  });

  // Chain each step with dountil + map pattern
  compiledSteps.forEach((step, index) => {
    workflow = workflow
      .dountil(step, async ({ inputData: { stepCompleted } }) => stepCompleted);
    
    // Add map to clear output between steps (except for the last step)
    if (index < compiledSteps.length - 1) {
      workflow = workflow.map(async () => ({}));
    }
  });
  
  workflow.commit();

  return {
    id: spec.id,
    workflow
  };
}

export async function compileWorkflows(workflows: WorkflowInput[]) : Promise<Record<string, {
  id: string,
  workflow: Workflow
}>> {
  const compiledWorkflows = await Promise.all(workflows.map(compileWorkflow));

  return Object.fromEntries(compiledWorkflows.map(wf => [wf.id, wf]));
} 

// Example usage:
/*
const exampleSpec: WorkflowInput = {
  id: "custom-strategy-workflow",
  description: "A custom strategy workflow from JSON",
  steps: [
    {
      id: "research-step",
      description: "Research the market",
      prompt: "Research the market for the user's business and understand their competitive landscape.",
      acceptance_criteria: "You have a comprehensive understanding of the market and competitors."
    },
    {
      id: "analysis-step", 
      description: "Analyze findings",
      prompt: "Analyze the research findings and identify key opportunities and threats.",
      acceptance_criteria: ["Analysis is complete", "Clear opportunities identified", "Threats documented"]
    }
  ]
};

const compiledWorkflow = compileWorkflow(exampleSpec);
*/