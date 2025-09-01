import { VibeflowAgentClient } from "./client";
import { z } from "zod";
export { VibeflowAgentClient };

export const startWorkflowResultSchema = z.object({
  runId: z.string().optional(),
  suspendPayload: z.any().optional(),
  status: z.enum(["suspended"]).optional()
});

export const getNextStepResultSchema = z.object({
  suspendPayload: z.any().optional(),
  status: z.enum(["suspended", "success"]).optional()
});

export type StartWorkflowResult = z.infer<typeof startWorkflowResultSchema>;
export type GetNextStepResult = z.infer<typeof getNextStepResultSchema>;

const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

export async function startWorkflow(workflowId: string) : Promise<StartWorkflowResult> {
  const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
  const mastraClient = await vibeflowAgentClient.createMastraClient();

  try {
    const workflow = mastraClient.getWorkflow(workflowId);
    const run = await workflow.createRun();
    const result = await workflow.startAsync({
        runId: run.runId,
        inputData: {
            start: true
        },
      });
    
    console.log("Started workflow, run ID:", run.runId, result);
    
    if (result.status === "suspended" && result.suspended.length > 0) {
      const suspendedStepName = result.suspended[0][0];
      const suspendPayload = result.steps[suspendedStepName].suspendPayload;
      
      return {
        runId: run.runId,
        suspendPayload,
        status: "suspended" as const,
      };
    } else if (result.status === "success") {
      throw new Error("You forgot to add a suspended step to your workflow");
    } else {
      throw new Error("Workflow failed to start");
    }
  } catch (error) {
    throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
  }
}

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