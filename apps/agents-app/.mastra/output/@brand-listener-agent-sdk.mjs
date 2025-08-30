import { MastraClient } from '@mastra/client-js';

class VibeflowAgentClient {
  baseUrl;
  constructor(baseUrl) {
    if (!baseUrl) {
      throw new Error("Base URL is required");
    }
    this.baseUrl = baseUrl;
  }
  async createMastraClient() {
    return new MastraClient({
      baseUrl: this.baseUrl
    });
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
        stepName: suspendedStepName,
        suspendPayload,
        status: "suspended"
      };
    } else if (result.status === "success") {
      throw new Error("No suspended step found to resume");
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
    throw new Error("No active workflow found. Please start a workflow first.");
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
        stepName: nextSuspendedStepName,
        suspendPayload: nextSuspendPayload,
        status: "suspended"
      };
    } else if (result.status === "success") {
      return {
        status: "success",
        message: "Workflow completed successfully"
      };
    } else {
      return {
        status: "error",
        message: "Workflow failed to resume"
      };
    }
  } catch (error) {
    throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { getNextStep as g, startWorkflow as s };
//# sourceMappingURL=@brand-listener-agent-sdk.mjs.map
