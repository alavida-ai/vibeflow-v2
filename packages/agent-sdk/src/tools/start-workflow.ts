import { VibeflowAgentClient } from "../client";
import { StartWorkflowResult } from "./types";
import { createLogger } from "@vibeflow/logging";

const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

const logger = createLogger({
    context: "cli",
    name: "agent-sdk"
});


  
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
      
      logger.info("Started workflow, run ID:", JSON.stringify(run.runId, null, 2) as any, JSON.stringify(result, null, 2) as any);
      
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
  