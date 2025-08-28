import { RuntimeContext } from "@mastra/core/runtime-context";
import { MastraClient } from "@mastra/client-js";

export const mastraClient = new MastraClient({
  baseUrl: "http://localhost:4111/",
});

// Define the context type
type WorkflowRuntimeContext = {
  "current-run-id": string;
  "workflowId": string;
};

const runtimeContext = new RuntimeContext<WorkflowRuntimeContext>();

export async function startWorkflow(workflowId: string, inputData: Record<string, any> = { start: true }) {
  try {
    const workflow = mastraClient.getWorkflow(workflowId as "testWorkflow");
    const run = await workflow.createRun();
    const result = await workflow.startAsync({
        runId: run.runId,
        inputData: inputData,
      });
    
    // Store in context for subsequent calls
    runtimeContext.set("current-run-id", run.runId);
    runtimeContext.set("workflowId", workflowId);
    console.log("Started workflow, run ID:", run.runId, result);
    
    if (result.status === "suspended" && result.suspended.length > 0) {
      const suspendedStepName = result.suspended[0][0];
      const suspendPayload = result.steps[suspendedStepName].suspendPayload;
      
      return {
        runId: run.runId,
        stepName: suspendedStepName,
        suspendPayload,
        status: "suspended" as const
      };
    } else if (result.status === "success") {
      return {
        runId: run.runId,
        status: "success" as const,
        result: result.result
      };
    } else {
      return {
        runId: run.runId,
        status: "error" as const,
        message: "Workflow failed"
      };
    }
  } catch (error) {
    throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getNextStep() {
  const workflowId = runtimeContext.get("workflowId") as string;
  const runId = runtimeContext.get("current-run-id") as string;

  console.log("workflowId", workflowId);
  console.log("runId", runId);
  
  if (!workflowId || !runId) {
    throw new Error("No active workflow found. Please start a workflow first.");
  }
  
  try {
    const workflow = mastraClient.getWorkflow(workflowId as "testWorkflow");
    
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
          stepCompleted: true // All steps use the same completion signal
        }
      });
      
    if (result.status === "suspended" && result.suspended.length > 0) {
      const nextSuspendedStepName = result.suspended[0][0];
      const nextSuspendPayload = result.steps[nextSuspendedStepName].suspendPayload;
      
      return {
        stepName: nextSuspendedStepName,
        suspendPayload: nextSuspendPayload,
        status: "suspended" as const
      };
    } else if (result.status === "success") {
      // Clean up the context since workflow is complete
      runtimeContext.delete("current-run-id");
      runtimeContext.delete("workflowId");
      return {
        status: "success" as const,
        result: result.result
      };
    } else {
      return {
        status: "error" as const,
        message: "Workflow failed during resume"
      };
    }
  } catch (error) {
    throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
  }
}
