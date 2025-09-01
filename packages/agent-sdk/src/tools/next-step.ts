import { z } from "zod";
import { VibeflowAgentClient } from "../client";


  export const getNextStepResultSchema = z.object({
    suspendPayload: z.any().optional(),
    status: z.enum(["suspended", "success"]).optional()
  });
  
  export type GetNextStepResult = z.infer<typeof getNextStepResultSchema>;
  
  const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";
  
  
  export async function getNextStep({
      runId,
      workflowId
  }: {
      runId: string;
      workflowId: string;
  }) : Promise<GetNextStepResult> {
    if (!workflowId || !runId) {
      throw new Error("No active workflow runId or workflowId found. Please start a workflow first.");
    }
    
    try {
      const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
      const mastraClient = await vibeflowAgentClient.createMastraClient();
  
      const workflow = mastraClient.getWorkflow(workflowId);
      
      // Get the current workflow state to find suspended steps
      const currentState = await workflow.runExecutionResult(runId);
      console.log("currentState", currentState);
      let step = null;
      
      // Find the suspended step from current state
      if (currentState.status === "suspended") {
        // Get the first suspended step
        const suspendedSteps = Object.entries(currentState.steps)
          .filter(([, stepState]) => (stepState as any).status === "suspended");
        if (suspendedSteps.length > 0) {
          step = suspendedSteps[0][0];
          console.log("step", step);
        }
      }
      
      if (!step) {
        throw new Error("No suspended step found to resume");
      }
      
      const result = await workflow.resumeAsync({
          runId: runId,
          step: step,
          resumeData: {
            stepCompleted: true
          }
        });
        
      if (result.status === "suspended" && result.suspended.length > 0) {
        const nextSuspendedStepName = result.suspended[0][0];
        const nextSuspendPayload = result.steps[nextSuspendedStepName].suspendPayload;
        
        return {
          suspendPayload: nextSuspendPayload,
          status: "suspended" as const,
        };
      } else if (result.status === "success") {
        return {
          status: "success" as const,
        };    
      } else {
        throw new Error("Workflow failed to resume");
      }
    } catch (error) {
      throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
    }
  }