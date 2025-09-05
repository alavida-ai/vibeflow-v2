import { compileWorkflow } from "../utils/spec-compiler";
import type { WorkflowInput } from "@vibeflow/compiler";

// Example of how to use the dynamic workflow generator
export const dynamicTestSpec: WorkflowInput = {
  id: "dynamic-test-workflow",
  description: "A test workflow created using the dynamic generator",
  steps: [
    {
      id: "initial-research-step",
      description: "Initial research and discovery",
      prompt: "Help the user understand their current situation and gather initial requirements. Ask clarifying questions to understand their goals and constraints.",
      acceptance_criteria: "You have a clear understanding of the user's current situation, goals, and any constraints they have."
    },
    {
      id: "strategy-development-step", 
      description: "Strategy development",
      prompt: "Based on the research, develop a strategic approach to help the user achieve their goals. Consider multiple options and recommend the best path forward.",
      acceptance_criteria: "A clear strategic plan has been developed with specific recommendations and next steps."
    },
    {
      id: "implementation-planning-step",
      description: "Implementation planning", 
      prompt: "Create a detailed implementation plan with specific actions, timelines, and success metrics. Break down the strategy into actionable steps.",
      acceptance_criteria: [
        "A comprehensive implementation plan exists with clear actions",
        "Timelines are defined for each action",
        "Success metrics are established"
      ]
    }
  ]
};

// Export a function to create the workflow
export function createDynamicTestWorkflow() {
  return compileWorkflow(dynamicTestSpec);
}
