import { MastraClient } from '@mastra/client-js';
import { z } from 'zod';

class VibeflowAgentClient {
  baseUrl;
  constructor(baseUrl) {
    if (!baseUrl) {
      throw new Error("Base URL is required");
    }
    this.baseUrl = baseUrl;
  }
  async createMastraClient() {
    try {
      return new MastraClient({
        baseUrl: this.baseUrl
      });
    } catch (error) {
      console.error("Error creating Mastra client", error);
      throw new Error("Error creating Mastra client");
    }
  }
  async createMastraAgent(agentName) {
    if (!agentName) {
      throw new Error("Agent name is required");
    }
    const mastraClient = await this.createMastraClient();
    const agent = mastraClient.getAgent(agentName);
    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent;
  }
}

const startWorkflowResultSchema = z.object({
  runId: z.string().optional(),
  suspendPayload: z.any().optional(),
  status: z.enum(["suspended"]).optional()
});
const getNextStepResultSchema = z.object({
  suspendPayload: z.any().optional(),
  status: z.enum(["suspended", "success"]).optional()
});
const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";
async function startWorkflow(workflowId) {
  const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
  const mastraClient = await vibeflowAgentClient.createMastraClient();
  try {
    const workflow = mastraClient.getWorkflow(workflowId);
    const run = await workflow.createRun();
    const result = await workflow.startAsync({
      runId: run.runId,
      inputData: {
        start: true
      }
    });
    console.log("Started workflow, run ID:", run.runId, result);
    if (result.status === "suspended" && result.suspended.length > 0) {
      const suspendedStepName = result.suspended[0][0];
      const suspendPayload = result.steps[suspendedStepName].suspendPayload;
      return {
        runId: run.runId,
        suspendPayload,
        status: "suspended"
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
async function getNextStep({
  runId,
  workflowId
}) {
  if (!workflowId || !runId) {
    throw new Error("No active workflow runId or workflowId found. Please start a workflow first.");
  }
  try {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const workflow = mastraClient.getWorkflow(workflowId);
    const currentState = await workflow.runExecutionResult(runId);
    console.log("currentState", currentState);
    let step = null;
    if (currentState.status === "suspended") {
      const suspendedSteps = Object.entries(currentState.steps).filter(([, stepState]) => stepState.status === "suspended");
      if (suspendedSteps.length > 0) {
        step = suspendedSteps[0][0];
        console.log("step", step);
      }
    }
    if (!step) {
      throw new Error("No suspended step found to resume");
    }
    const result = await workflow.resumeAsync({
      runId,
      step,
      resumeData: {
        stepCompleted: true
      }
    });
    if (result.status === "suspended" && result.suspended.length > 0) {
      const nextSuspendedStepName = result.suspended[0][0];
      const nextSuspendPayload = result.steps[nextSuspendedStepName].suspendPayload;
      return {
        suspendPayload: nextSuspendPayload,
        status: "suspended"
      };
    } else if (result.status === "success") {
      return {
        status: "success"
      };
    } else {
      throw new Error("Workflow failed to resume");
    }
  } catch (error) {
    throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { startWorkflow as a, getNextStep as b, getNextStepResultSchema as g, startWorkflowResultSchema as s };
//# sourceMappingURL=@brand-listener-agent-sdk.mjs.map
