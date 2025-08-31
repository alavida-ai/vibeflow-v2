import { E as EMITTER_SYMBOL, W as Workflow, R as Run, _ as __decoratorStart, a as __decorateElement, b as __runInitializers } from './agent.mjs';
import { RuntimeContext } from './@mastra-core-runtime-context.mjs';
import { M as MastraError } from './chunk-MCOVMKIS.mjs';
import { M as MastraBase, R as RegisteredLogger, C as ConsoleLogger, L as LogLevel } from './chunk-6GF5M4GX.mjs';
import EventEmitter from 'events';
import { randomUUID } from 'crypto';
import { a as augmentWithInit } from './chunk-436FFEF6.mjs';
import { T as Telemetry, I as InstrumentClass } from './telemetry.mjs';
import { r as registerHook } from './hooks.mjs';
import { s as setupAITracing, g as getAllAITracing, a as shutdownAITracingRegistry } from './ai-tracing.mjs';

var StepExecutor = class extends MastraBase {
  mastra;
  constructor({ mastra }) {
    super({ name: "StepExecutor", component: RegisteredLogger.WORKFLOW });
    this.mastra = mastra;
  }
  __registerMastra(mastra) {
    this.mastra = mastra;
  }
  async execute(params) {
    const { step, stepResults, runId, runtimeContext, runCount = 0 } = params;
    const abortController = new AbortController();
    let suspended;
    let bailed;
    const startedAt = Date.now();
    let stepInfo = {
      ...stepResults[step.id],
      startedAt,
      payload: params.input ?? {}
    };
    if (params.resumeData) {
      delete stepInfo.suspendPayload?.["__workflow_meta"];
      stepInfo.resumePayload = params.resumeData;
      stepInfo.resumedAt = Date.now();
    }
    try {
      const stepResult = await step.execute({
        workflowId: params.workflowId,
        runId,
        mastra: this.mastra,
        runtimeContext,
        inputData: typeof params.foreachIdx === "number" ? params.input?.[params.foreachIdx] : params.input,
        runCount,
        resumeData: params.resumeData,
        getInitData: () => stepResults?.input,
        getStepResult: (step2) => {
          if (!step2?.id) {
            return null;
          }
          const result = stepResults[step2.id];
          if (result?.status === "success") {
            return result.output;
          }
          return null;
        },
        suspend: async (suspendPayload) => {
          suspended = { payload: { ...suspendPayload, __workflow_meta: { runId, path: [step.id] } } };
        },
        bail: (result) => {
          bailed = { payload: result };
        },
        // TODO
        writer: void 0,
        abort: () => {
          abortController?.abort();
        },
        [EMITTER_SYMBOL]: params.emitter,
        // TODO: refactor this to use our PubSub actually
        engine: {},
        abortSignal: abortController?.signal,
        // TODO
        tracingContext: {}
      });
      const endedAt = Date.now();
      let finalResult;
      if (suspended) {
        finalResult = {
          ...stepInfo,
          status: "suspended",
          suspendedAt: endedAt
        };
        if (suspended.payload) {
          finalResult.suspendPayload = suspended.payload;
        }
      } else if (bailed) {
        finalResult = {
          ...stepInfo,
          // @ts-ignore
          status: "bailed",
          endedAt,
          output: bailed.payload
        };
      } else {
        finalResult = {
          ...stepInfo,
          status: "success",
          endedAt,
          output: stepResult
        };
      }
      return finalResult;
    } catch (error) {
      const endedAt = Date.now();
      return {
        ...stepInfo,
        status: "failed",
        endedAt,
        error: error instanceof Error ? error?.stack ?? error.message : error
      };
    }
  }
  async evaluateConditions(params) {
    const { step, stepResults, runId, runtimeContext, runCount = 0 } = params;
    const abortController = new AbortController();
    const ee = new EventEmitter();
    const results = await Promise.all(
      step.conditions.map((condition) => {
        try {
          return this.evaluateCondition({
            workflowId: params.workflowId,
            condition,
            runId,
            runtimeContext,
            inputData: params.input,
            runCount,
            resumeData: params.resumeData,
            abortController,
            stepResults,
            emitter: ee
          });
        } catch (e) {
          console.error("error evaluating condition", e);
          return false;
        }
      })
    );
    const idxs = results.reduce((acc, result, idx) => {
      if (result) {
        acc.push(idx);
      }
      return acc;
    }, []);
    return idxs;
  }
  async evaluateCondition({
    workflowId,
    condition,
    runId,
    inputData,
    resumeData,
    stepResults,
    runtimeContext,
    emitter,
    abortController,
    runCount = 0
  }) {
    return condition({
      workflowId,
      runId,
      mastra: this.mastra,
      runtimeContext,
      inputData,
      runCount,
      resumeData,
      getInitData: () => stepResults?.input,
      getStepResult: (step) => {
        if (!step?.id) {
          return null;
        }
        const result = stepResults[step.id];
        if (result?.status === "success") {
          return result.output;
        }
        return null;
      },
      suspend: async (_suspendPayload) => {
        throw new Error("Not implemented");
      },
      bail: (_result) => {
        throw new Error("Not implemented");
      },
      // TODO
      writer: void 0,
      abort: () => {
        abortController?.abort();
      },
      [EMITTER_SYMBOL]: emitter,
      // TODO: refactor this to use our PubSub actually
      engine: {},
      abortSignal: abortController?.signal,
      // TODO
      tracingContext: {}
    });
  }
  async resolveSleep(params) {
    const { step, stepResults, runId, runtimeContext, runCount = 0 } = params;
    const abortController = new AbortController();
    const ee = new EventEmitter();
    if (step.duration) {
      return step.duration;
    }
    if (!step.fn) {
      return 0;
    }
    try {
      return await step.fn({
        workflowId: params.workflowId,
        runId,
        mastra: this.mastra,
        runtimeContext,
        inputData: params.input,
        runCount,
        resumeData: params.resumeData,
        getInitData: () => stepResults?.input,
        getStepResult: (step2) => {
          if (!step2?.id) {
            return null;
          }
          const result = stepResults[step2.id];
          if (result?.status === "success") {
            return result.output;
          }
          return null;
        },
        suspend: async (_suspendPayload) => {
          throw new Error("Not implemented");
        },
        bail: (_result) => {
          throw new Error("Not implemented");
        },
        abort: () => {
          abortController?.abort();
        },
        // TODO
        writer: void 0,
        [EMITTER_SYMBOL]: ee,
        // TODO: refactor this to use our PubSub actually
        engine: {},
        abortSignal: abortController?.signal,
        // TODO
        tracingContext: {}
      });
    } catch (e) {
      console.error("error evaluating condition", e);
      return 0;
    }
  }
  async resolveSleepUntil(params) {
    const { step, stepResults, runId, runtimeContext, runCount = 0 } = params;
    const abortController = new AbortController();
    const ee = new EventEmitter();
    if (step.date) {
      return step.date.getTime() - Date.now();
    }
    if (!step.fn) {
      return 0;
    }
    try {
      const result = await step.fn({
        workflowId: params.workflowId,
        runId,
        mastra: this.mastra,
        runtimeContext,
        inputData: params.input,
        runCount,
        resumeData: params.resumeData,
        getInitData: () => stepResults?.input,
        getStepResult: (step2) => {
          if (!step2?.id) {
            return null;
          }
          const result2 = stepResults[step2.id];
          if (result2?.status === "success") {
            return result2.output;
          }
          return null;
        },
        suspend: async (_suspendPayload) => {
          throw new Error("Not implemented");
        },
        bail: (_result) => {
          throw new Error("Not implemented");
        },
        abort: () => {
          abortController?.abort();
        },
        // TODO
        writer: void 0,
        [EMITTER_SYMBOL]: ee,
        // TODO: refactor this to use our PubSub actually
        engine: {},
        abortSignal: abortController?.signal,
        // TODO
        tracingContext: {}
      });
      return result.getTime() - Date.now();
    } catch (e) {
      console.error("error evaluating condition", e);
      return 0;
    }
  }
};

// src/events/processor.ts
var EventProcessor = class {
  mastra;
  __registerMastra(mastra) {
    this.mastra = mastra;
  }
  constructor({ mastra }) {
    this.mastra = mastra;
  }
};
async function processWorkflowLoop({
  workflowId,
  prevResult,
  runId,
  executionPath,
  stepResults,
  activeSteps,
  resumeSteps,
  resumeData,
  parentWorkflow,
  runtimeContext,
  runCount = 0
}, {
  pubsub,
  stepExecutor,
  step,
  stepResult
}) {
  const loopCondition = await stepExecutor.evaluateCondition({
    workflowId,
    condition: step.condition,
    runId,
    stepResults,
    emitter: new EventEmitter(),
    // TODO
    runtimeContext: new RuntimeContext(),
    // TODO
    inputData: prevResult?.status === "success" ? prevResult.output : void 0,
    resumeData,
    abortController: new AbortController(),
    runCount
  });
  if (step.loopType === "dountil") {
    if (loopCondition) {
      await pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          stepResults,
          prevResult: stepResult,
          resumeData,
          activeSteps,
          runtimeContext
        }
      });
    } else {
      await pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          stepResults,
          prevResult: stepResult,
          resumeData,
          activeSteps,
          runtimeContext,
          runCount
        }
      });
    }
  } else {
    if (loopCondition) {
      await pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          stepResults,
          prevResult: stepResult,
          resumeData,
          activeSteps,
          runtimeContext,
          runCount
        }
      });
    } else {
      await pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          stepResults,
          prevResult: stepResult,
          resumeData,
          activeSteps,
          runtimeContext
        }
      });
    }
  }
}
async function processWorkflowForEach({
  workflowId,
  prevResult,
  runId,
  executionPath,
  stepResults,
  activeSteps,
  resumeSteps,
  resumeData,
  parentWorkflow,
  runtimeContext
}, {
  pubsub,
  mastra,
  step
}) {
  const currentResult = stepResults[step.step.id];
  const idx = currentResult?.output?.length ?? 0;
  const targetLen = prevResult?.output?.length ?? 0;
  if (idx >= targetLen && currentResult.output.filter((r) => r !== null).length >= targetLen) {
    await pubsub.publish("workflows", {
      type: "workflow.step.run",
      runId,
      data: {
        parentWorkflow,
        workflowId,
        runId,
        executionPath: executionPath.slice(0, -1).concat([executionPath[executionPath.length - 1] + 1]),
        resumeSteps,
        stepResults,
        prevResult: currentResult,
        resumeData,
        activeSteps,
        runtimeContext
      }
    });
    return;
  } else if (idx >= targetLen) {
    return;
  }
  if (executionPath.length === 1 && idx === 0) {
    const concurrency = Math.min(step.opts.concurrency ?? 1, targetLen);
    const dummyResult = Array.from({ length: concurrency }, () => null);
    await mastra.getStorage()?.updateWorkflowResults({
      workflowName: workflowId,
      runId,
      stepId: step.step.id,
      result: {
        status: "succcess",
        output: dummyResult,
        startedAt: Date.now(),
        payload: prevResult?.output
      },
      runtimeContext
    });
    for (let i = 0; i < concurrency; i++) {
      await pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath: [executionPath[0], i],
          resumeSteps,
          stepResults,
          prevResult,
          resumeData,
          activeSteps,
          runtimeContext
        }
      });
    }
    return;
  }
  currentResult.output.push(null);
  await mastra.getStorage()?.updateWorkflowResults({
    workflowName: workflowId,
    runId,
    stepId: step.step.id,
    result: {
      status: "succcess",
      output: currentResult.output,
      startedAt: Date.now(),
      payload: prevResult?.output
    },
    runtimeContext
  });
  await pubsub.publish("workflows", {
    type: "workflow.step.run",
    runId,
    data: {
      parentWorkflow,
      workflowId,
      runId,
      executionPath: [executionPath[0], idx],
      resumeSteps,
      stepResults,
      prevResult,
      resumeData,
      activeSteps,
      runtimeContext
    }
  });
}
async function processWorkflowParallel({
  workflowId,
  runId,
  executionPath,
  stepResults,
  activeSteps,
  resumeSteps,
  prevResult,
  resumeData,
  parentWorkflow,
  runtimeContext
}, {
  pubsub,
  step
}) {
  for (let i = 0; i < step.steps.length; i++) {
    const nestedStep = step.steps[i];
    if (nestedStep?.type === "step") {
      activeSteps[nestedStep.step.id] = true;
    }
  }
  await Promise.all(
    step.steps.map(async (_step, idx) => {
      return pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          workflowId,
          runId,
          executionPath: executionPath.concat([idx]),
          resumeSteps,
          stepResults,
          prevResult,
          resumeData,
          parentWorkflow,
          activeSteps,
          runtimeContext
        }
      });
    })
  );
}
async function processWorkflowConditional({
  workflowId,
  runId,
  executionPath,
  stepResults,
  activeSteps,
  resumeSteps,
  prevResult,
  resumeData,
  parentWorkflow,
  runtimeContext
}, {
  pubsub,
  stepExecutor,
  step
}) {
  const idxs = await stepExecutor.evaluateConditions({
    workflowId,
    step,
    runId,
    stepResults,
    emitter: new EventEmitter(),
    // TODO
    runtimeContext: new RuntimeContext(),
    // TODO
    input: prevResult?.status === "success" ? prevResult.output : void 0,
    resumeData
  });
  const truthyIdxs = {};
  for (let i = 0; i < idxs.length; i++) {
    truthyIdxs[idxs[i]] = true;
  }
  await Promise.all(
    step.steps.map(async (step2, idx) => {
      if (truthyIdxs[idx]) {
        if (step2?.type === "step") {
          activeSteps[step2.step.id] = true;
        }
        return pubsub.publish("workflows", {
          type: "workflow.step.run",
          runId,
          data: {
            workflowId,
            runId,
            executionPath: executionPath.concat([idx]),
            resumeSteps,
            stepResults,
            prevResult,
            resumeData,
            parentWorkflow,
            activeSteps,
            runtimeContext
          }
        });
      } else {
        return pubsub.publish("workflows", {
          type: "workflow.step.end",
          runId,
          data: {
            workflowId,
            runId,
            executionPath: executionPath.concat([idx]),
            resumeSteps,
            stepResults,
            prevResult: { status: "skipped" },
            resumeData,
            parentWorkflow,
            activeSteps,
            runtimeContext
          }
        });
      }
    })
  );
}
async function processWorkflowWaitForEvent(workflowData, {
  pubsub,
  eventName,
  currentState
}) {
  const executionPath = currentState?.waitingPaths[eventName];
  if (!executionPath) {
    return;
  }
  const currentStep = getStep(workflowData.workflow, executionPath);
  const prevResult = {
    status: "success",
    output: currentState?.context[currentStep?.id ?? "input"]?.payload
  };
  await pubsub.publish("workflows", {
    type: "workflow.step.run",
    runId: workflowData.runId,
    data: {
      workflowId: workflowData.workflowId,
      runId: workflowData.runId,
      executionPath,
      resumeSteps: [],
      resumeData: workflowData.resumeData,
      parentWorkflow: workflowData.parentWorkflow,
      stepResults: currentState?.context,
      prevResult,
      activeSteps: [],
      runtimeContext: currentState?.runtimeContext
    }
  });
}
async function processWorkflowSleep({
  workflowId,
  runId,
  executionPath,
  stepResults,
  activeSteps,
  resumeSteps,
  prevResult,
  resumeData,
  parentWorkflow,
  runtimeContext
}, {
  pubsub,
  stepExecutor,
  step
}) {
  const startedAt = Date.now();
  await pubsub.publish(`workflow.events.v2.${runId}`, {
    type: "watch",
    runId,
    data: {
      type: "step-waiting",
      payload: {
        id: step.id,
        status: "waiting",
        payload: prevResult.status === "success" ? prevResult.output : void 0,
        startedAt
      }
    }
  });
  const duration = await stepExecutor.resolveSleep({
    workflowId,
    step,
    runId,
    stepResults,
    emitter: new EventEmitter(),
    // TODO
    runtimeContext: new RuntimeContext(),
    // TODO
    input: prevResult?.status === "success" ? prevResult.output : void 0,
    resumeData
  });
  setTimeout(
    async () => {
      await pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-result",
          payload: {
            id: step.id,
            status: "success",
            payload: prevResult.status === "success" ? prevResult.output : void 0,
            output: prevResult.status === "success" ? prevResult.output : void 0,
            startedAt,
            endedAt: Date.now()
          }
        }
      });
      await pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-finish",
          payload: {
            id: step.id,
            metadata: {}
          }
        }
      });
      await pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          workflowId,
          runId,
          executionPath: executionPath.slice(0, -1).concat([executionPath[executionPath.length - 1] + 1]),
          resumeSteps,
          stepResults,
          prevResult,
          resumeData,
          parentWorkflow,
          activeSteps,
          runtimeContext
        }
      });
    },
    duration < 0 ? 0 : duration
  );
}
async function processWorkflowSleepUntil({
  workflowId,
  runId,
  executionPath,
  stepResults,
  activeSteps,
  resumeSteps,
  prevResult,
  resumeData,
  parentWorkflow,
  runtimeContext
}, {
  pubsub,
  stepExecutor,
  step
}) {
  const startedAt = Date.now();
  const duration = await stepExecutor.resolveSleepUntil({
    workflowId,
    step,
    runId,
    stepResults,
    emitter: new EventEmitter(),
    // TODO
    runtimeContext: new RuntimeContext(),
    // TODO
    input: prevResult?.status === "success" ? prevResult.output : void 0,
    resumeData
  });
  await pubsub.publish(`workflow.events.v2.${runId}`, {
    type: "watch",
    runId,
    data: {
      type: "step-waiting",
      payload: {
        id: step.id,
        status: "waiting",
        payload: prevResult.status === "success" ? prevResult.output : void 0,
        startedAt
      }
    }
  });
  setTimeout(
    async () => {
      await pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-result",
          payload: {
            id: step.id,
            status: "success",
            payload: prevResult.status === "success" ? prevResult.output : void 0,
            output: prevResult.status === "success" ? prevResult.output : void 0,
            startedAt,
            endedAt: Date.now()
          }
        }
      });
      await pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-finish",
          payload: {
            id: step.id,
            metadata: {}
          }
        }
      });
      await pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          workflowId,
          runId,
          executionPath: executionPath.slice(0, -1).concat([executionPath[executionPath.length - 1] + 1]),
          resumeSteps,
          stepResults,
          prevResult,
          resumeData,
          parentWorkflow,
          activeSteps,
          runtimeContext
        }
      });
    },
    duration < 0 ? 0 : duration
  );
}

// src/workflows/evented/workflow-event-processor/index.ts
var WorkflowEventProcessor = class extends EventProcessor {
  stepExecutor;
  constructor({ mastra }) {
    super({ mastra });
    this.stepExecutor = new StepExecutor({ mastra });
  }
  __registerMastra(mastra) {
    super.__registerMastra(mastra);
    this.stepExecutor.__registerMastra(mastra);
  }
  async errorWorkflow({
    parentWorkflow,
    workflowId,
    runId,
    resumeSteps,
    stepResults,
    resumeData,
    runtimeContext
  }, e) {
    await this.mastra.pubsub.publish("workflows", {
      type: "workflow.fail",
      runId,
      data: {
        workflowId,
        runId,
        executionPath: [],
        resumeSteps,
        stepResults,
        prevResult: { status: "failed", error: e.stack ?? e.message },
        runtimeContext,
        resumeData,
        activeSteps: {},
        parentWorkflow
      }
    });
  }
  async processWorkflowCancel({ workflowId, runId }) {
    const currentState = await this.mastra.getStorage()?.updateWorkflowState({
      workflowName: workflowId,
      runId,
      opts: {
        status: "canceled"
      }
    });
    await this.endWorkflow({
      workflow: void 0,
      workflowId,
      runId,
      stepResults: currentState?.context,
      prevResult: { status: "canceled" },
      runtimeContext: currentState?.runtimeContext,
      executionPath: [],
      activeSteps: {},
      resumeSteps: [],
      resumeData: void 0,
      parentWorkflow: void 0
    });
  }
  async processWorkflowStart({
    workflow,
    parentWorkflow,
    workflowId,
    runId,
    resumeSteps,
    prevResult,
    resumeData,
    executionPath,
    stepResults,
    runtimeContext
  }) {
    await this.mastra.getStorage()?.persistWorkflowSnapshot({
      workflowName: workflow.id,
      runId,
      snapshot: {
        activePaths: [],
        suspendedPaths: {},
        waitingPaths: {},
        serializedStepGraph: workflow.serializedStepGraph,
        timestamp: Date.now(),
        runId,
        status: "running",
        context: stepResults ?? {
          input: prevResult?.status === "success" ? prevResult.output : void 0
        },
        value: {}
      }
    });
    await this.mastra.pubsub.publish("workflows", {
      type: "workflow.step.run",
      runId,
      data: {
        parentWorkflow,
        workflowId,
        runId,
        executionPath: executionPath ?? [0],
        resumeSteps,
        stepResults: stepResults ?? {
          input: prevResult?.status === "success" ? prevResult.output : void 0
        },
        prevResult,
        runtimeContext,
        resumeData,
        activeSteps: {}
      }
    });
  }
  async endWorkflow(args) {
    const { stepResults, workflowId, runId, prevResult } = args;
    await this.mastra.getStorage()?.updateWorkflowState({
      workflowName: workflowId,
      runId,
      opts: {
        status: "success",
        result: prevResult
      }
    });
    await this.mastra.pubsub.publish(`workflow.events.${runId}`, {
      type: "watch",
      runId,
      data: {
        type: "watch",
        payload: {
          currentStep: void 0,
          workflowState: {
            status: prevResult.status,
            steps: stepResults,
            result: prevResult.status === "success" ? prevResult.output : null,
            error: prevResult.error ?? null
          }
        },
        eventTimestamp: Date.now()
      }
    });
    await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
      type: "watch",
      runId,
      data: {
        type: "finish",
        payload: {
          runId
        }
      }
    });
    await this.mastra.pubsub.publish("workflows", {
      type: "workflow.end",
      runId,
      data: { ...args, workflow: void 0 }
    });
  }
  async processWorkflowEnd(args) {
    const { resumeSteps, prevResult, resumeData, parentWorkflow, activeSteps, runtimeContext, runId } = args;
    if (parentWorkflow) {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          workflowId: parentWorkflow.workflowId,
          runId: parentWorkflow.runId,
          executionPath: parentWorkflow.executionPath,
          resumeSteps,
          stepResults: parentWorkflow.stepResults,
          prevResult,
          resumeData,
          activeSteps,
          parentWorkflow: parentWorkflow.parentWorkflow,
          parentContext: parentWorkflow,
          runtimeContext
        }
      });
    }
    await this.mastra.pubsub.publish("workflows-finish", {
      type: "workflow.end",
      runId,
      data: { ...args, workflow: void 0 }
    });
  }
  async processWorkflowSuspend(args) {
    const { resumeSteps, prevResult, resumeData, parentWorkflow, activeSteps, runId, runtimeContext } = args;
    if (parentWorkflow) {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          workflowId: parentWorkflow.workflowId,
          runId: parentWorkflow.runId,
          executionPath: parentWorkflow.executionPath,
          resumeSteps,
          stepResults: parentWorkflow.stepResults,
          prevResult: {
            ...prevResult,
            suspendPayload: {
              ...prevResult.suspendPayload,
              __workflow_meta: {
                runId,
                path: parentWorkflow?.stepId ? [parentWorkflow.stepId].concat(prevResult.suspendPayload?.__workflow_meta?.path ?? []) : prevResult.suspendPayload?.__workflow_meta?.path ?? []
              }
            }
          },
          resumeData,
          activeSteps,
          runtimeContext,
          parentWorkflow: parentWorkflow.parentWorkflow,
          parentContext: parentWorkflow
        }
      });
    }
    await this.mastra.pubsub.publish("workflows-finish", {
      type: "workflow.suspend",
      runId,
      data: { ...args, workflow: void 0 }
    });
  }
  async processWorkflowFail(args) {
    const { workflowId, runId, resumeSteps, prevResult, resumeData, parentWorkflow, activeSteps, runtimeContext } = args;
    await this.mastra.getStorage()?.updateWorkflowState({
      workflowName: workflowId,
      runId,
      opts: {
        status: "failed",
        error: prevResult.error
      }
    });
    if (parentWorkflow) {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          workflowId: parentWorkflow.workflowId,
          runId: parentWorkflow.runId,
          executionPath: parentWorkflow.executionPath,
          resumeSteps,
          stepResults: parentWorkflow.stepResults,
          prevResult,
          resumeData,
          activeSteps,
          runtimeContext,
          parentWorkflow: parentWorkflow.parentWorkflow,
          parentContext: parentWorkflow
        }
      });
    }
    await this.mastra.pubsub.publish("workflows-finish", {
      type: "workflow.fail",
      runId,
      data: { ...args, workflow: void 0 }
    });
  }
  async processWorkflowStepRun({
    workflow,
    workflowId,
    runId,
    executionPath,
    stepResults,
    activeSteps,
    resumeSteps,
    prevResult,
    resumeData,
    parentWorkflow,
    runtimeContext,
    runCount = 0
  }) {
    let stepGraph = workflow.stepGraph;
    if (!executionPath?.length) {
      return this.errorWorkflow(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        new MastraError({
          id: "MASTRA_WORKFLOW",
          text: `Execution path is empty: ${JSON.stringify(executionPath)}`,
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "SYSTEM" /* SYSTEM */
        })
      );
    }
    let step = stepGraph[executionPath[0]];
    if (!step) {
      return this.errorWorkflow(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        new MastraError({
          id: "MASTRA_WORKFLOW",
          text: `Step not found in step graph: ${JSON.stringify(executionPath)}`,
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "SYSTEM" /* SYSTEM */
        })
      );
    }
    if ((step.type === "parallel" || step.type === "conditional") && executionPath.length > 1) {
      step = step.steps[executionPath[1]];
    } else if (step.type === "parallel") {
      return processWorkflowParallel(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        {
          pubsub: this.mastra.pubsub,
          step
        }
      );
    } else if (step?.type === "conditional") {
      return processWorkflowConditional(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        {
          pubsub: this.mastra.pubsub,
          stepExecutor: this.stepExecutor,
          step
        }
      );
    } else if (step?.type === "sleep") {
      return processWorkflowSleep(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        {
          pubsub: this.mastra.pubsub,
          stepExecutor: this.stepExecutor,
          step
        }
      );
    } else if (step?.type === "sleepUntil") {
      return processWorkflowSleepUntil(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        {
          pubsub: this.mastra.pubsub,
          stepExecutor: this.stepExecutor,
          step
        }
      );
    } else if (step?.type === "waitForEvent" && !resumeData) {
      await this.mastra.getStorage()?.updateWorkflowResults({
        workflowName: workflowId,
        runId,
        stepId: step.step.id,
        result: {
          startedAt: Date.now(),
          status: "waiting",
          payload: prevResult.status === "success" ? prevResult.output : void 0
        },
        runtimeContext
      });
      await this.mastra.getStorage()?.updateWorkflowState({
        workflowName: workflowId,
        runId,
        opts: {
          status: "waiting",
          waitingPaths: {
            [step.event]: executionPath
          }
        }
      });
      await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-waiting",
          payload: {
            id: step.step.id,
            status: "waiting",
            payload: prevResult.status === "success" ? prevResult.output : void 0,
            startedAt: Date.now()
          }
        }
      });
      return;
    } else if (step?.type === "foreach" && executionPath.length === 1) {
      return processWorkflowForEach(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        {
          pubsub: this.mastra.pubsub,
          mastra: this.mastra,
          step
        }
      );
    }
    if (!isExecutableStep(step)) {
      return this.errorWorkflow(
        {
          workflowId,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          prevResult,
          resumeData,
          parentWorkflow,
          runtimeContext
        },
        new MastraError({
          id: "MASTRA_WORKFLOW",
          text: `Step is not executable: ${step?.type} -- ${JSON.stringify(executionPath)}`,
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "SYSTEM" /* SYSTEM */
        })
      );
    }
    activeSteps[step.step.id] = true;
    if (step.step instanceof EventedWorkflow) {
      if (resumeSteps?.length > 1) {
        const stepData = stepResults[step.step.id];
        const nestedRunId = stepData?.suspendPayload?.__workflow_meta?.runId;
        if (!nestedRunId) {
          return this.errorWorkflow(
            {
              workflowId,
              runId,
              executionPath,
              stepResults,
              activeSteps,
              resumeSteps,
              prevResult,
              resumeData,
              parentWorkflow,
              runtimeContext
            },
            new MastraError({
              id: "MASTRA_WORKFLOW",
              text: `Nested workflow run id not found: ${JSON.stringify(stepResults)}`,
              domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
              category: "SYSTEM" /* SYSTEM */
            })
          );
        }
        const snapshot = await this.mastra?.getStorage()?.loadWorkflowSnapshot({
          workflowName: step.step.id,
          runId: nestedRunId
        });
        const nestedStepResults = snapshot?.context;
        const nestedSteps = resumeSteps.slice(1);
        await this.mastra.pubsub.publish("workflows", {
          type: "workflow.resume",
          runId,
          data: {
            workflowId: step.step.id,
            parentWorkflow: {
              stepId: step.step.id,
              workflowId,
              runId,
              executionPath,
              resumeSteps,
              stepResults,
              input: prevResult,
              parentWorkflow
            },
            executionPath: snapshot?.suspendedPaths?.[nestedSteps[0]],
            runId: nestedRunId,
            resumeSteps: nestedSteps,
            stepResults: nestedStepResults,
            prevResult,
            resumeData,
            activeSteps,
            runtimeContext
          }
        });
      } else {
        await this.mastra.pubsub.publish("workflows", {
          type: "workflow.start",
          runId,
          data: {
            workflowId: step.step.id,
            parentWorkflow: {
              stepId: step.step.id,
              workflowId,
              runId,
              executionPath,
              resumeSteps,
              stepResults,
              input: prevResult,
              parentWorkflow
            },
            executionPath: [0],
            runId: randomUUID(),
            resumeSteps,
            prevResult,
            resumeData,
            activeSteps,
            runtimeContext
          }
        });
      }
      return;
    }
    if (step.type === "step" || step.type === "waitForEvent") {
      await this.mastra.pubsub.publish(`workflow.events.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "watch",
          payload: {
            currentStep: { id: step.step.id, status: "running" },
            workflowState: {
              status: "running",
              steps: stepResults,
              error: null,
              result: null
            }
          },
          eventTimestamp: Date.now()
        }
      });
      await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-start",
          payload: {
            id: step.step.id,
            startedAt: Date.now(),
            payload: prevResult.status === "success" ? prevResult.output : void 0,
            status: "running"
          }
        }
      });
    }
    const ee = new EventEmitter();
    ee.on("watch-v2", async (event) => {
      await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: event
      });
    });
    const rc = new RuntimeContext();
    for (const [key, value] of Object.entries(runtimeContext)) {
      rc.set(key, value);
    }
    const stepResult = await this.stepExecutor.execute({
      workflowId,
      step: step.step,
      runId,
      stepResults,
      emitter: ee,
      runtimeContext: rc,
      input: prevResult?.output,
      resumeData: step.type === "waitForEvent" || resumeSteps?.length === 1 && resumeSteps?.[0] === step.step.id ? resumeData : void 0,
      runCount,
      foreachIdx: step.type === "foreach" ? executionPath[1] : void 0
    });
    runtimeContext = Object.fromEntries(rc.entries());
    if (stepResult.status === "bailed") {
      stepResult.status = "success";
      await this.endWorkflow({
        workflow,
        resumeData,
        parentWorkflow,
        workflowId,
        runId,
        executionPath,
        resumeSteps,
        stepResults: {
          ...stepResults,
          [step.step.id]: stepResult
        },
        prevResult: stepResult,
        activeSteps,
        runtimeContext
      });
      return;
    }
    if (stepResult.status === "failed") {
      if (runCount >= (workflow.retryConfig.attempts ?? 0)) {
        await this.mastra.pubsub.publish("workflows", {
          type: "workflow.step.end",
          runId,
          data: {
            parentWorkflow,
            workflowId,
            runId,
            executionPath,
            resumeSteps,
            stepResults,
            prevResult: stepResult,
            activeSteps,
            runtimeContext
          }
        });
      } else {
        return this.mastra.pubsub.publish("workflows", {
          type: "workflow.step.run",
          runId,
          data: {
            parentWorkflow,
            workflowId,
            runId,
            executionPath,
            resumeSteps,
            stepResults,
            prevResult,
            activeSteps,
            runtimeContext,
            runCount: runCount + 1
          }
        });
      }
    }
    if (step.type === "loop") {
      await processWorkflowLoop(
        {
          workflowId,
          prevResult: stepResult,
          runId,
          executionPath,
          stepResults,
          activeSteps,
          resumeSteps,
          resumeData,
          parentWorkflow,
          runtimeContext,
          runCount: runCount + 1
        },
        {
          pubsub: this.mastra.pubsub,
          stepExecutor: this.stepExecutor,
          step,
          stepResult
        }
      );
    } else {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          stepResults,
          prevResult: stepResult,
          activeSteps,
          runtimeContext
        }
      });
    }
  }
  async processWorkflowStepEnd({
    workflow,
    workflowId,
    runId,
    executionPath,
    resumeSteps,
    prevResult,
    parentWorkflow,
    stepResults,
    activeSteps,
    parentContext,
    runtimeContext
  }) {
    let step = workflow.stepGraph[executionPath[0]];
    if ((step?.type === "parallel" || step?.type === "conditional") && executionPath.length > 1) {
      step = step.steps[executionPath[1]];
    }
    if (!step) {
      return this.errorWorkflow(
        {
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          prevResult,
          stepResults,
          activeSteps,
          runtimeContext
        },
        new MastraError({
          id: "MASTRA_WORKFLOW",
          text: `Step not found: ${JSON.stringify(executionPath)}`,
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "SYSTEM" /* SYSTEM */
        })
      );
    }
    if (step.type === "foreach") {
      const snapshot = await this.mastra.getStorage()?.loadWorkflowSnapshot({
        workflowName: workflowId,
        runId
      });
      const currentIdx = executionPath[1];
      const currentResult = snapshot?.context?.[step.step.id]?.output;
      let newResult = prevResult;
      if (currentIdx !== void 0) {
        if (currentResult) {
          currentResult[currentIdx] = prevResult.output;
          newResult = { ...prevResult, output: currentResult };
        } else {
          newResult = { ...prevResult, output: [prevResult.output] };
        }
      }
      const newStepResults = await this.mastra.getStorage()?.updateWorkflowResults({
        workflowName: workflow.id,
        runId,
        stepId: step.step.id,
        result: newResult,
        runtimeContext
      });
      if (!newStepResults) {
        return;
      }
      stepResults = newStepResults;
    } else if (isExecutableStep(step)) {
      delete activeSteps[step.step.id];
      if (parentContext) {
        prevResult = stepResults[step.step.id] = {
          ...prevResult,
          payload: parentContext.input?.output ?? {}
        };
      }
      const newStepResults = await this.mastra.getStorage()?.updateWorkflowResults({
        workflowName: workflow.id,
        runId,
        stepId: step.step.id,
        result: prevResult,
        runtimeContext
      });
      if (!newStepResults) {
        return;
      }
      stepResults = newStepResults;
    }
    if (!prevResult?.status || prevResult.status === "failed") {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.fail",
        runId,
        data: {
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          parentWorkflow,
          stepResults,
          prevResult,
          activeSteps,
          runtimeContext
        }
      });
      return;
    } else if (prevResult.status === "suspended") {
      const suspendedPaths = {};
      const suspendedStep = getStep(workflow, executionPath);
      if (suspendedStep) {
        suspendedPaths[suspendedStep.id] = executionPath;
      }
      await this.mastra.getStorage()?.updateWorkflowState({
        workflowName: workflowId,
        runId,
        opts: {
          status: "suspended",
          result: prevResult,
          suspendedPaths
        }
      });
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.suspend",
        runId,
        data: {
          workflowId,
          runId,
          executionPath,
          resumeSteps,
          parentWorkflow,
          stepResults,
          prevResult,
          activeSteps,
          runtimeContext
        }
      });
      await this.mastra.pubsub.publish(`workflow.events.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "watch",
          payload: {
            currentStep: { ...prevResult, id: step?.step?.id },
            workflowState: {
              status: "suspended",
              steps: stepResults,
              suspendPayload: prevResult.suspendPayload
            }
          }
        }
      });
      await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-suspended",
          payload: {
            id: step?.step?.id,
            ...prevResult,
            suspendedAt: Date.now(),
            suspendPayload: prevResult.suspendPayload
          }
        }
      });
      return;
    }
    if (step?.type === "step" || step?.type === "waitForEvent") {
      await this.mastra.pubsub.publish(`workflow.events.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "watch",
          payload: {
            currentStep: { ...prevResult, id: step.step.id },
            workflowState: {
              status: "running",
              steps: stepResults,
              error: null,
              result: null
            }
          },
          eventTimestamp: Date.now()
        }
      });
      await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "step-result",
          payload: {
            id: step.step.id,
            ...prevResult
          }
        }
      });
      if (prevResult.status === "success") {
        await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
          type: "watch",
          runId,
          data: {
            type: "step-finish",
            payload: {
              id: step.step.id,
              metadata: {}
            }
          }
        });
      }
    }
    step = workflow.stepGraph[executionPath[0]];
    if ((step?.type === "parallel" || step?.type === "conditional") && executionPath.length > 1) {
      let skippedCount = 0;
      const allResults = step.steps.reduce(
        (acc, step2) => {
          if (isExecutableStep(step2)) {
            const res = stepResults?.[step2.step.id];
            if (res && res.status === "success") {
              acc[step2.step.id] = res?.output;
            } else if (res?.status === "skipped") {
              skippedCount++;
            }
          }
          return acc;
        },
        {}
      );
      const keys = Object.keys(allResults);
      if (keys.length + skippedCount < step.steps.length) {
        return;
      }
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.end",
        runId,
        data: {
          parentWorkflow,
          workflowId,
          runId,
          executionPath: executionPath.slice(0, -1),
          resumeSteps,
          stepResults,
          prevResult: { status: "success", output: allResults },
          activeSteps,
          runtimeContext
        }
      });
    } else if (step?.type === "foreach") {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          workflowId,
          runId,
          executionPath: executionPath.slice(0, -1),
          resumeSteps,
          parentWorkflow,
          stepResults,
          prevResult: { ...prevResult, output: prevResult?.payload },
          activeSteps,
          runtimeContext
        }
      });
    } else if (executionPath[0] >= workflow.stepGraph.length - 1) {
      await this.endWorkflow({
        workflow,
        parentWorkflow,
        workflowId,
        runId,
        executionPath,
        resumeSteps,
        stepResults,
        prevResult,
        activeSteps,
        runtimeContext
      });
    } else {
      await this.mastra.pubsub.publish("workflows", {
        type: "workflow.step.run",
        runId,
        data: {
          workflowId,
          runId,
          executionPath: executionPath.slice(0, -1).concat([executionPath[executionPath.length - 1] + 1]),
          resumeSteps,
          parentWorkflow,
          stepResults,
          prevResult,
          activeSteps,
          runtimeContext
        }
      });
    }
  }
  async loadData({
    workflowId,
    runId
  }) {
    const snapshot = await this.mastra.getStorage()?.loadWorkflowSnapshot({
      workflowName: workflowId,
      runId
    });
    return snapshot;
  }
  async process(event, ack) {
    const { type, data } = event;
    const workflowData = data;
    const currentState = await this.loadData({
      workflowId: workflowData.workflowId,
      runId: workflowData.runId
    });
    if (currentState?.status === "canceled" && type !== "workflow.end") {
      return;
    }
    if (type.startsWith("workflow.user-event.")) {
      await processWorkflowWaitForEvent(
        {
          ...workflowData,
          workflow: this.mastra.getWorkflow(workflowData.workflowId)
        },
        {
          pubsub: this.mastra.pubsub,
          eventName: type.split(".").slice(2).join("."),
          currentState
        }
      );
      return;
    }
    const workflow = workflowData.parentWorkflow ? getNestedWorkflow(this.mastra, workflowData.parentWorkflow) : this.mastra.getWorkflow(workflowData.workflowId);
    if (!workflow) {
      return this.errorWorkflow(
        workflowData,
        new MastraError({
          id: "MASTRA_WORKFLOW",
          text: `Workflow not found: ${workflowData.workflowId}`,
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "SYSTEM" /* SYSTEM */
        })
      );
    }
    if (type === "workflow.start" || type === "workflow.resume") {
      const { runId } = workflowData;
      await this.mastra.pubsub.publish(`workflow.events.v2.${runId}`, {
        type: "watch",
        runId,
        data: {
          type: "start",
          payload: {
            runId
          }
        }
      });
    }
    switch (type) {
      case "workflow.cancel":
        await this.processWorkflowCancel({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.start":
        await this.processWorkflowStart({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.resume":
        await this.processWorkflowStart({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.end":
        await this.processWorkflowEnd({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.step.end":
        await this.processWorkflowStepEnd({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.step.run":
        await this.processWorkflowStepRun({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.suspend":
        await this.processWorkflowSuspend({
          workflow,
          ...workflowData
        });
        break;
      case "workflow.fail":
        await this.processWorkflowFail({
          workflow,
          ...workflowData
        });
        break;
    }
    try {
      await ack?.();
    } catch (e) {
      console.error("Error acking event", e);
    }
  }
};
var EventedWorkflow = class extends Workflow {
  constructor(params) {
    super(params);
  }
  __registerMastra(mastra) {
    super.__registerMastra(mastra);
    this.executionEngine.__registerMastra(mastra);
  }
  async createRunAsync(options) {
    const runIdToUse = options?.runId || randomUUID();
    const run = this.runs.get(runIdToUse) ?? new EventedRun({
      workflowId: this.id,
      runId: runIdToUse,
      executionEngine: this.executionEngine,
      executionGraph: this.executionGraph,
      serializedStepGraph: this.serializedStepGraph,
      mastra: this.mastra,
      retryConfig: this.retryConfig,
      cleanup: () => this.runs.delete(runIdToUse)
    });
    this.runs.set(runIdToUse, run);
    const workflowSnapshotInStorage = await this.getWorkflowRunExecutionResult(runIdToUse);
    if (!workflowSnapshotInStorage) {
      await this.mastra?.getStorage()?.persistWorkflowSnapshot({
        workflowName: this.id,
        runId: runIdToUse,
        snapshot: {
          runId: runIdToUse,
          status: "pending",
          value: {},
          context: {},
          activePaths: [],
          serializedStepGraph: this.serializedStepGraph,
          suspendedPaths: {},
          waitingPaths: {},
          result: void 0,
          error: void 0,
          // @ts-ignore
          timestamp: Date.now()
        }
      });
    }
    return run;
  }
};
var EventedRun = class extends Run {
  constructor(params) {
    super(params);
    this.serializedStepGraph = params.serializedStepGraph;
  }
  async start({
    inputData,
    runtimeContext
  }) {
    runtimeContext = runtimeContext ?? new RuntimeContext();
    await this.mastra?.getStorage()?.persistWorkflowSnapshot({
      workflowName: this.workflowId,
      runId: this.runId,
      snapshot: {
        runId: this.runId,
        serializedStepGraph: this.serializedStepGraph,
        value: {},
        context: {},
        runtimeContext: Object.fromEntries(runtimeContext.entries()),
        activePaths: [],
        suspendedPaths: {},
        waitingPaths: {},
        timestamp: Date.now(),
        status: "running"
      }
    });
    const result = await this.executionEngine.execute({
      workflowId: this.workflowId,
      runId: this.runId,
      graph: this.executionGraph,
      serializedStepGraph: this.serializedStepGraph,
      input: inputData,
      emitter: {
        emit: async (event, data) => {
          this.emitter.emit(event, data);
        },
        on: (event, callback) => {
          this.emitter.on(event, callback);
        },
        off: (event, callback) => {
          this.emitter.off(event, callback);
        },
        once: (event, callback) => {
          this.emitter.once(event, callback);
        }
      },
      retryConfig: this.retryConfig,
      runtimeContext,
      abortController: this.abortController
    });
    console.dir({ startResult: result }, { depth: null });
    if (result.status !== "suspended") {
      this.cleanup?.();
    }
    return result;
  }
  /**
   * Starts the workflow execution with the provided input as a stream
   * @param input The input data for the workflow
   * @returns A promise that resolves to the workflow output
   */
  stream({ inputData, runtimeContext } = {}) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const unwatch = this.watch(async (event) => {
      try {
        await writer.write(event);
      } catch {
      }
    }, "watch-v2");
    this.closeStreamAction = async () => {
      unwatch();
      try {
        await writer.close();
      } catch (err) {
        console.error("Error closing stream:", err);
      } finally {
        writer.releaseLock();
      }
    };
    this.executionResults = this.start({ inputData, runtimeContext }).then((result) => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {
        });
      }
      return result;
    });
    return {
      stream: readable,
      getWorkflowState: () => this.executionResults
    };
  }
  async streamAsync({
    inputData,
    runtimeContext
  } = {}) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const unwatch = await this.watchAsync(async (event) => {
      try {
        await writer.write(event);
      } catch {
      }
    }, "watch-v2");
    this.closeStreamAction = async () => {
      await unwatch();
      try {
        await writer.close();
      } catch (err) {
        console.error("Error closing stream:", err);
      } finally {
        writer.releaseLock();
      }
    };
    this.executionResults = this.start({ inputData, runtimeContext }).then((result) => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {
        });
      }
      return result;
    });
    return {
      stream: readable,
      getWorkflowState: () => this.executionResults
    };
  }
  async resume(params) {
    const steps = (Array.isArray(params.step) ? params.step : [params.step]).map(
      (step) => typeof step === "string" ? step : step?.id
    );
    if (steps.length === 0) {
      throw new Error("No steps provided to resume");
    }
    const snapshot = await this.mastra?.getStorage()?.loadWorkflowSnapshot({
      workflowName: this.workflowId,
      runId: this.runId
    });
    const resumePath = snapshot?.suspendedPaths?.[steps[0]];
    if (!resumePath) {
      throw new Error(
        `No resume path found for step ${JSON.stringify(steps)}, currently suspended paths are ${JSON.stringify(snapshot?.suspendedPaths)}`
      );
    }
    console.dir(
      { resume: { runtimeContextObj: snapshot?.runtimeContext, runtimeContext: params.runtimeContext } },
      { depth: null }
    );
    const runtimeContextObj = snapshot?.runtimeContext ?? {};
    const runtimeContext = params.runtimeContext ?? new RuntimeContext();
    for (const [key, value] of Object.entries(runtimeContextObj)) {
      runtimeContext.set(key, value);
    }
    const executionResultPromise = this.executionEngine.execute({
      workflowId: this.workflowId,
      runId: this.runId,
      graph: this.executionGraph,
      serializedStepGraph: this.serializedStepGraph,
      input: params.resumeData,
      resume: {
        steps,
        stepResults: snapshot?.context,
        resumePayload: params.resumeData,
        resumePath
      },
      emitter: {
        emit: (event, data) => {
          this.emitter.emit(event, data);
          return Promise.resolve();
        },
        on: (event, callback) => {
          this.emitter.on(event, callback);
        },
        off: (event, callback) => {
          this.emitter.off(event, callback);
        },
        once: (event, callback) => {
          this.emitter.once(event, callback);
        }
      },
      runtimeContext,
      abortController: this.abortController
    }).then((result) => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {
        });
      }
      return result;
    });
    this.executionResults = executionResultPromise;
    return executionResultPromise;
  }
  watch(cb, type = "watch") {
    const watchCb = async (event, ack) => {
      if (event.runId !== this.runId) {
        return;
      }
      cb(event.data);
      await ack?.();
    };
    if (type === "watch-v2") {
      this.mastra?.pubsub.subscribe(`workflow.events.v2.${this.runId}`, watchCb).catch(() => {
      });
    } else {
      this.mastra?.pubsub.subscribe(`workflow.events.${this.runId}`, watchCb).catch(() => {
      });
    }
    return () => {
      if (type === "watch-v2") {
        this.mastra?.pubsub.unsubscribe(`workflow.events.v2.${this.runId}`, watchCb).catch(() => {
        });
      } else {
        this.mastra?.pubsub.unsubscribe(`workflow.events.${this.runId}`, watchCb).catch(() => {
        });
      }
    };
  }
  async watchAsync(cb, type = "watch") {
    const watchCb = async (event, ack) => {
      if (event.runId !== this.runId) {
        return;
      }
      cb(event.data);
      await ack?.();
    };
    if (type === "watch-v2") {
      await this.mastra?.pubsub.subscribe(`workflow.events.v2.${this.runId}`, watchCb).catch(() => {
      });
    } else {
      await this.mastra?.pubsub.subscribe(`workflow.events.${this.runId}`, watchCb).catch(() => {
      });
    }
    return async () => {
      if (type === "watch-v2") {
        await this.mastra?.pubsub.unsubscribe(`workflow.events.v2.${this.runId}`, watchCb).catch(() => {
        });
      } else {
        await this.mastra?.pubsub.unsubscribe(`workflow.events.${this.runId}`, watchCb).catch(() => {
        });
      }
    };
  }
  async cancel() {
    await this.mastra?.pubsub.publish("workflows", {
      type: "workflow.cancel",
      runId: this.runId,
      data: {
        workflowId: this.workflowId,
        runId: this.runId
      }
    });
  }
  async sendEvent(eventName, data) {
    await this.mastra?.pubsub.publish("workflows", {
      type: `workflow.user-event.${eventName}`,
      runId: this.runId,
      data: {
        workflowId: this.workflowId,
        runId: this.runId,
        resumeData: data
      }
    });
  }
};

// src/workflows/evented/workflow-event-processor/utils.ts
function getNestedWorkflow(mastra, { workflowId, executionPath, parentWorkflow }) {
  let workflow = null;
  if (parentWorkflow) {
    const nestedWorkflow = getNestedWorkflow(mastra, parentWorkflow);
    if (!nestedWorkflow) {
      return null;
    }
    workflow = nestedWorkflow;
  }
  workflow = workflow ?? mastra.getWorkflow(workflowId);
  const stepGraph = workflow.stepGraph;
  let parentStep = stepGraph[executionPath[0]];
  if (parentStep?.type === "parallel" || parentStep?.type === "conditional") {
    parentStep = parentStep.steps[executionPath[1]];
  }
  if (parentStep?.type === "step" || parentStep?.type === "loop") {
    return parentStep.step;
  }
  return null;
}
function getStep(workflow, executionPath) {
  let idx = 0;
  const stepGraph = workflow.stepGraph;
  let parentStep = stepGraph[executionPath[0]];
  if (parentStep?.type === "parallel" || parentStep?.type === "conditional") {
    parentStep = parentStep.steps[executionPath[1]];
    idx++;
  } else if (parentStep?.type === "foreach") {
    return parentStep.step;
  }
  if (!(parentStep?.type === "step" || parentStep?.type === "loop" || parentStep?.type === "waitForEvent")) {
    return null;
  }
  if (parentStep instanceof EventedWorkflow) {
    return getStep(parentStep, executionPath.slice(idx + 1));
  }
  return parentStep.step;
}
function isExecutableStep(step) {
  return step.type === "step" || step.type === "loop" || step.type === "waitForEvent" || step.type === "foreach";
}

// src/events/pubsub.ts
var PubSub = class {
};

// src/logger/noop-logger.ts
var noopLogger = {
  debug: () => {
  },
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  cleanup: async () => {
  },
  getTransports: () => /* @__PURE__ */ new Map(),
  trackException: () => {
  },
  getLogs: async () => ({ logs: [], total: 0, page: 1, perPage: 100, hasMore: false }),
  getLogsByRunId: async () => ({ logs: [], total: 0, page: 1, perPage: 100, hasMore: false })
};

var EventEmitterPubSub = class extends PubSub {
  emitter;
  constructor() {
    super();
    this.emitter = new EventEmitter();
  }
  async publish(topic, event) {
    const id = crypto.randomUUID();
    const createdAt = /* @__PURE__ */new Date();
    this.emitter.emit(topic, {
      ...event,
      id,
      createdAt
    });
  }
  async subscribe(topic, cb) {
    this.emitter.on(topic, cb);
  }
  async unsubscribe(topic, cb) {
    this.emitter.off(topic, cb);
  }
  async flush() {}
};

// src/mastra/hooks.ts
function createOnScorerHook(mastra) {
  return async hookData => {
    if (!mastra.getStorage()) {
      return;
    }
    const storage = mastra.getStorage();
    const entityId = hookData.entity.id;
    const entityType = hookData.entityType;
    const scorer = hookData.scorer;
    let scorerToUse;
    try {
      if (entityType === "AGENT") {
        const agent = mastra.getAgentById(entityId);
        const scorers = await agent.getScorers();
        scorerToUse = scorers[scorer.id];
      } else if (entityType === "WORKFLOW") {
        const workflow = mastra.getWorkflowById(entityId);
        const scorers = await workflow.getScorers();
        scorerToUse = scorers[scorer.id];
      } else {
        return;
      }
      if (!scorerToUse) {
        throw new MastraError({
          id: "MASTRA_SCORER_NOT_FOUND",
          domain: "MASTRA" /* MASTRA */,
          category: "USER" /* USER */,
          text: `Scorer with ID ${hookData.scorer.id} not found`
        });
      }
      let input = hookData.input;
      let output = hookData.output;
      if (entityType !== "AGENT") {
        output = {
          object: hookData.output
        };
      }
      const {
        structuredOutput,
        ...rest
      } = hookData;
      const runResult = await scorerToUse.scorer.run({
        ...rest,
        input,
        output
      });
      const payload = {
        ...rest,
        ...runResult,
        entityId,
        scorerId: hookData.scorer.id,
        metadata: {
          structuredOutput: !!structuredOutput
        }
      };
      await storage?.saveScore(payload);
    } catch (error) {
      const mastraError = new MastraError({
        id: "MASTRA_SCORER_FAILED_TO_RUN_HOOK",
        domain: "SCORER" /* SCORER */,
        category: "USER" /* USER */,
        details: {
          scorerId: scorer.id,
          entityId,
          entityType
        }
      }, error);
      mastra.getLogger()?.trackException(mastraError);
      mastra.getLogger()?.error(mastraError.toString());
    }
  };
}

// src/mastra/index.ts
var _Mastra_decorators, _init;
_Mastra_decorators = [InstrumentClass({
  prefix: "mastra",
  excludeMethods: ["getLogger", "getTelemetry"]
})];
var Mastra = class {
  #vectors;
  #agents;
  #logger;
  #legacy_workflows;
  #workflows;
  #tts;
  #deployer;
  #serverMiddleware = [];
  #telemetry;
  #storage;
  #memory;
  #networks;
  #vnext_networks;
  #server;
  #mcpServers;
  #bundler;
  #idGenerator;
  #pubsub;
  #events = {};
  /**
   * @deprecated use getTelemetry() instead
   */
  get telemetry() {
    return this.#telemetry;
  }
  /**
   * @deprecated use getStorage() instead
   */
  get storage() {
    return this.#storage;
  }
  /**
   * @deprecated use getMemory() instead
   */
  get memory() {
    return this.#memory;
  }
  get pubsub() {
    return this.#pubsub;
  }
  getIdGenerator() {
    return this.#idGenerator;
  }
  /**
   * Generate a unique identifier using the configured generator or default to crypto.randomUUID()
   * @returns A unique string ID
   */
  generateId() {
    if (this.#idGenerator) {
      const id = this.#idGenerator();
      if (!id) {
        const error = new MastraError({
          id: "MASTRA_ID_GENERATOR_RETURNED_EMPTY_STRING",
          domain: "MASTRA" /* MASTRA */,
          category: "USER" /* USER */,
          text: "ID generator returned an empty string, which is not allowed"
        });
        this.#logger?.trackException(error);
        throw error;
      }
      return id;
    }
    return crypto.randomUUID();
  }
  setIdGenerator(idGenerator) {
    this.#idGenerator = idGenerator;
  }
  constructor(config) {
    if (config?.serverMiddleware) {
      this.#serverMiddleware = config.serverMiddleware.map(m => ({
        handler: m.handler,
        path: m.path || "/api/*"
      }));
    }
    if (config?.pubsub) {
      this.#pubsub = config.pubsub;
    } else {
      this.#pubsub = new EventEmitterPubSub();
    }
    this.#events = {};
    for (const topic in config?.events ?? {}) {
      if (!Array.isArray(config?.events?.[topic])) {
        this.#events[topic] = [config?.events?.[topic]];
      } else {
        this.#events[topic] = config?.events?.[topic] ?? [];
      }
    }
    const workflowEventProcessor = new WorkflowEventProcessor({
      mastra: this
    });
    const workflowEventCb = async (event, cb) => {
      try {
        await workflowEventProcessor.process(event, cb);
      } catch (e) {
        console.error("Error processing event", e);
      }
    };
    if (this.#events.workflows) {
      this.#events.workflows.push(workflowEventCb);
    } else {
      this.#events.workflows = [workflowEventCb];
    }
    let logger;
    if (config?.logger === false) {
      logger = noopLogger;
    } else {
      if (config?.logger) {
        logger = config.logger;
      } else {
        const levelOnEnv = process.env.NODE_ENV === "production" && process.env.MASTRA_DEV !== "true" ? LogLevel.WARN : LogLevel.INFO;
        logger = new ConsoleLogger({
          name: "Mastra",
          level: levelOnEnv
        });
      }
    }
    this.#logger = logger;
    this.#idGenerator = config?.idGenerator;
    let storage = config?.storage;
    if (storage) {
      storage = augmentWithInit(storage);
    }
    this.#telemetry = Telemetry.init(config?.telemetry);
    if (config?.telemetry?.enabled !== false && typeof globalThis !== "undefined" && globalThis.___MASTRA_TELEMETRY___ !== true) {
      this.#logger?.warn(`Mastra telemetry is enabled, but the required instrumentation file was not loaded. If you are using Mastra outside of the mastra server environment, see: https://mastra.ai/en/docs/observability/tracing#tracing-outside-mastra-server-environment`, `If you are using a custom instrumentation file or want to disable this warning, set the globalThis.___MASTRA_TELEMETRY___ variable to true in your instrumentation file.`);
    }
    if (config?.observability) {
      setupAITracing(config.observability);
    }
    if (this.#telemetry && storage) {
      this.#storage = this.#telemetry.traceClass(storage, {
        excludeMethods: ["__setTelemetry", "__getTelemetry", "batchTraceInsert", "getTraces", "getEvalsByAgentName"]
      });
      this.#storage.__setTelemetry(this.#telemetry);
    } else {
      this.#storage = storage;
    }
    if (config?.vectors) {
      let vectors = {};
      Object.entries(config.vectors).forEach(([key, vector]) => {
        if (this.#telemetry) {
          vectors[key] = this.#telemetry.traceClass(vector, {
            excludeMethods: ["__setTelemetry", "__getTelemetry"]
          });
          vectors[key].__setTelemetry(this.#telemetry);
        } else {
          vectors[key] = vector;
        }
      });
      this.#vectors = vectors;
    }
    if (config?.networks) {
      this.#networks = config.networks;
    }
    if (config?.vnext_networks) {
      this.#vnext_networks = config.vnext_networks;
    }
    if (config?.mcpServers) {
      this.#mcpServers = config.mcpServers;
      Object.entries(this.#mcpServers).forEach(([key, server]) => {
        server.setId(key);
        if (this.#telemetry) {
          server.__setTelemetry(this.#telemetry);
        }
        server.__registerMastra(this);
        server.__setLogger(this.getLogger());
      });
    }
    if (config && `memory` in config) {
      const error = new MastraError({
        id: "MASTRA_CONSTRUCTOR_INVALID_MEMORY_CONFIG",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `
  Memory should be added to Agents, not to Mastra.

Instead of:
  new Mastra({ memory: new Memory() })

do:
  new Agent({ memory: new Memory() })
`
      });
      this.#logger?.trackException(error);
      throw error;
    }
    if (config?.tts) {
      this.#tts = config.tts;
      Object.entries(this.#tts).forEach(([key, ttsCl]) => {
        if (this.#tts?.[key]) {
          if (this.#telemetry) {
            this.#tts[key] = this.#telemetry.traceClass(ttsCl, {
              excludeMethods: ["__setTelemetry", "__getTelemetry"]
            });
            this.#tts[key].__setTelemetry(this.#telemetry);
          }
        }
      });
    }
    const agents = {};
    if (config?.agents) {
      Object.entries(config.agents).forEach(([key, agent]) => {
        if (agents[key]) {
          const error = new MastraError({
            id: "MASTRA_AGENT_REGISTRATION_DUPLICATE_ID",
            domain: "MASTRA" /* MASTRA */,
            category: "USER" /* USER */,
            text: `Agent with name ID:${key} already exists`,
            details: {
              agentId: key
            }
          });
          this.#logger?.trackException(error);
          throw error;
        }
        agent.__registerMastra(this);
        agent.__registerPrimitives({
          logger: this.getLogger(),
          telemetry: this.#telemetry,
          storage: this.storage,
          memory: this.memory,
          agents,
          tts: this.#tts,
          vectors: this.#vectors
        });
        agents[key] = agent;
      });
    }
    this.#agents = agents;
    this.#networks = {};
    this.#vnext_networks = {};
    if (config?.networks) {
      Object.entries(config.networks).forEach(([key, network]) => {
        network.__registerMastra(this);
        this.#networks[key] = network;
      });
    }
    if (config?.vnext_networks) {
      Object.entries(config.vnext_networks).forEach(([key, network]) => {
        network.__registerMastra(this);
        this.#vnext_networks[key] = network;
      });
    }
    this.#legacy_workflows = {};
    if (config?.legacy_workflows) {
      Object.entries(config.legacy_workflows).forEach(([key, workflow]) => {
        workflow.__registerMastra(this);
        workflow.__registerPrimitives({
          logger: this.getLogger(),
          telemetry: this.#telemetry,
          storage: this.storage,
          memory: this.memory,
          agents,
          tts: this.#tts,
          vectors: this.#vectors
        });
        this.#legacy_workflows[key] = workflow;
        const workflowSteps = Object.values(workflow.steps).filter(step => !!step.workflowId && !!step.workflow);
        if (workflowSteps.length > 0) {
          workflowSteps.forEach(step => {
            this.#legacy_workflows[step.workflowId] = step.workflow;
          });
        }
      });
    }
    this.#workflows = {};
    if (config?.workflows) {
      Object.entries(config.workflows).forEach(([key, workflow]) => {
        workflow.__registerMastra(this);
        workflow.__registerPrimitives({
          logger: this.getLogger(),
          telemetry: this.#telemetry,
          storage: this.storage,
          memory: this.memory,
          agents,
          tts: this.#tts,
          vectors: this.#vectors
        });
        this.#workflows[key] = workflow;
      });
    }
    if (config?.server) {
      this.#server = config.server;
    }
    registerHook("onScorerRun" /* ON_SCORER_RUN */, createOnScorerHook(this));
    this.setLogger({
      logger
    });
  }
  getAgent(name) {
    const agent = this.#agents?.[name];
    if (!agent) {
      const error = new MastraError({
        id: "MASTRA_GET_AGENT_BY_NAME_NOT_FOUND",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Agent with name ${String(name)} not found`,
        details: {
          status: 404,
          agentName: String(name),
          agents: Object.keys(this.#agents ?? {}).join(", ")
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    return this.#agents[name];
  }
  getAgentById(id) {
    let agent = Object.values(this.#agents).find(a => a.id === id);
    if (!agent) {
      try {
        agent = this.getAgent(id);
      } catch {}
    }
    if (!agent) {
      const error = new MastraError({
        id: "MASTRA_GET_AGENT_BY_AGENT_ID_NOT_FOUND",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Agent with id ${String(id)} not found`,
        details: {
          status: 404,
          agentId: String(id),
          agents: Object.keys(this.#agents ?? {}).join(", ")
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    return agent;
  }
  getAgents() {
    return this.#agents;
  }
  getVector(name) {
    const vector = this.#vectors?.[name];
    if (!vector) {
      const error = new MastraError({
        id: "MASTRA_GET_VECTOR_BY_NAME_NOT_FOUND",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Vector with name ${String(name)} not found`,
        details: {
          status: 404,
          vectorName: String(name),
          vectors: Object.keys(this.#vectors ?? {}).join(", ")
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    return vector;
  }
  getVectors() {
    return this.#vectors;
  }
  getDeployer() {
    return this.#deployer;
  }
  legacy_getWorkflow(id, {
    serialized
  } = {}) {
    const workflow = this.#legacy_workflows?.[id];
    if (!workflow) {
      const error = new MastraError({
        id: "MASTRA_GET_LEGACY_WORKFLOW_BY_ID_NOT_FOUND",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Workflow with ID ${String(id)} not found`,
        details: {
          status: 404,
          workflowId: String(id),
          workflows: Object.keys(this.#legacy_workflows ?? {}).join(", ")
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    if (serialized) {
      return {
        name: workflow.name
      };
    }
    return workflow;
  }
  getWorkflow(id, {
    serialized
  } = {}) {
    const workflow = this.#workflows?.[id];
    if (!workflow) {
      const error = new MastraError({
        id: "MASTRA_GET_WORKFLOW_BY_ID_NOT_FOUND",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Workflow with ID ${String(id)} not found`,
        details: {
          status: 404,
          workflowId: String(id),
          workflows: Object.keys(this.#workflows ?? {}).join(", ")
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    if (serialized) {
      return {
        name: workflow.name
      };
    }
    return workflow;
  }
  getWorkflowById(id) {
    let workflow = Object.values(this.#workflows).find(a => a.id === id);
    if (!workflow) {
      try {
        workflow = this.getWorkflow(id);
      } catch {}
    }
    if (!workflow) {
      const error = new MastraError({
        id: "MASTRA_GET_WORKFLOW_BY_ID_NOT_FOUND",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Workflow with id ${String(id)} not found`,
        details: {
          status: 404,
          workflowId: String(id),
          workflows: Object.keys(this.#workflows ?? {}).join(", ")
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    return workflow;
  }
  legacy_getWorkflows(props = {}) {
    if (props.serialized) {
      return Object.entries(this.#legacy_workflows).reduce((acc, [k, v]) => {
        return {
          ...acc,
          [k]: {
            name: v.name
          }
        };
      }, {});
    }
    return this.#legacy_workflows;
  }
  getWorkflows(props = {}) {
    if (props.serialized) {
      return Object.entries(this.#workflows).reduce((acc, [k, v]) => {
        return {
          ...acc,
          [k]: {
            name: v.name
          }
        };
      }, {});
    }
    return this.#workflows;
  }
  setStorage(storage) {
    this.#storage = augmentWithInit(storage);
  }
  setLogger({
    logger
  }) {
    this.#logger = logger;
    if (this.#agents) {
      Object.keys(this.#agents).forEach(key => {
        this.#agents?.[key]?.__setLogger(this.#logger);
      });
    }
    if (this.#memory) {
      this.#memory.__setLogger(this.#logger);
    }
    if (this.#deployer) {
      this.#deployer.__setLogger(this.#logger);
    }
    if (this.#tts) {
      Object.keys(this.#tts).forEach(key => {
        this.#tts?.[key]?.__setLogger(this.#logger);
      });
    }
    if (this.#storage) {
      this.#storage.__setLogger(this.#logger);
    }
    if (this.#vectors) {
      Object.keys(this.#vectors).forEach(key => {
        this.#vectors?.[key]?.__setLogger(this.#logger);
      });
    }
    if (this.#mcpServers) {
      Object.keys(this.#mcpServers).forEach(key => {
        this.#mcpServers?.[key]?.__setLogger(this.#logger);
      });
    }
    const allTracingInstances = getAllAITracing();
    allTracingInstances.forEach(instance => {
      instance.__setLogger(this.#logger);
    });
  }
  setTelemetry(telemetry) {
    this.#telemetry = Telemetry.init(telemetry);
    if (this.#agents) {
      Object.keys(this.#agents).forEach(key => {
        if (this.#telemetry) {
          this.#agents?.[key]?.__setTelemetry(this.#telemetry);
        }
      });
    }
    if (this.#memory) {
      this.#memory = this.#telemetry.traceClass(this.#memory, {
        excludeMethods: ["__setTelemetry", "__getTelemetry"]
      });
      this.#memory.__setTelemetry(this.#telemetry);
    }
    if (this.#deployer) {
      this.#deployer = this.#telemetry.traceClass(this.#deployer, {
        excludeMethods: ["__setTelemetry", "__getTelemetry"]
      });
      this.#deployer.__setTelemetry(this.#telemetry);
    }
    if (this.#tts) {
      let tts = {};
      Object.entries(this.#tts).forEach(([key, ttsCl]) => {
        if (this.#telemetry) {
          tts[key] = this.#telemetry.traceClass(ttsCl, {
            excludeMethods: ["__setTelemetry", "__getTelemetry"]
          });
          tts[key].__setTelemetry(this.#telemetry);
        }
      });
      this.#tts = tts;
    }
    if (this.#storage) {
      this.#storage = this.#telemetry.traceClass(this.#storage, {
        excludeMethods: ["__setTelemetry", "__getTelemetry"]
      });
      this.#storage.__setTelemetry(this.#telemetry);
    }
    if (this.#vectors) {
      let vectors = {};
      Object.entries(this.#vectors).forEach(([key, vector]) => {
        if (this.#telemetry) {
          vectors[key] = this.#telemetry.traceClass(vector, {
            excludeMethods: ["__setTelemetry", "__getTelemetry"]
          });
          vectors[key].__setTelemetry(this.#telemetry);
        }
      });
      this.#vectors = vectors;
    }
  }
  getTTS() {
    return this.#tts;
  }
  getLogger() {
    return this.#logger;
  }
  getTelemetry() {
    return this.#telemetry;
  }
  getMemory() {
    return this.#memory;
  }
  getStorage() {
    return this.#storage;
  }
  getServerMiddleware() {
    return this.#serverMiddleware;
  }
  setServerMiddleware(serverMiddleware) {
    if (typeof serverMiddleware === "function") {
      this.#serverMiddleware = [{
        handler: serverMiddleware,
        path: "/api/*"
      }];
      return;
    }
    if (!Array.isArray(serverMiddleware)) {
      const error = new MastraError({
        id: "MASTRA_SET_SERVER_MIDDLEWARE_INVALID_TYPE",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: `Invalid middleware: expected a function or array, received ${typeof serverMiddleware}`
      });
      this.#logger?.trackException(error);
      throw error;
    }
    this.#serverMiddleware = serverMiddleware.map(m => {
      if (typeof m === "function") {
        return {
          handler: m,
          path: "/api/*"
        };
      }
      return {
        handler: m.handler,
        path: m.path || "/api/*"
      };
    });
  }
  getNetworks() {
    return Object.values(this.#networks || {});
  }
  vnext_getNetworks() {
    return Object.values(this.#vnext_networks || {});
  }
  getServer() {
    return this.#server;
  }
  getBundlerConfig() {
    return this.#bundler;
  }
  /**
   * Get a specific network by ID
   * @param networkId - The ID of the network to retrieve
   * @returns The network with the specified ID, or undefined if not found
   */
  getNetwork(networkId) {
    const networks = this.getNetworks();
    return networks.find(network => {
      const routingAgent = network.getRoutingAgent();
      return network.formatAgentId(routingAgent.name) === networkId;
    });
  }
  vnext_getNetwork(networkId) {
    const networks = this.vnext_getNetworks();
    return networks.find(network => network.id === networkId);
  }
  async getLogsByRunId({
    runId,
    transportId,
    fromDate,
    toDate,
    logLevel,
    filters,
    page,
    perPage
  }) {
    if (!transportId) {
      const error = new MastraError({
        id: "MASTRA_GET_LOGS_BY_RUN_ID_MISSING_TRANSPORT",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: "Transport ID is required",
        details: {
          runId,
          transportId
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    if (!this.#logger?.getLogsByRunId) {
      const error = new MastraError({
        id: "MASTRA_GET_LOGS_BY_RUN_ID_LOGGER_NOT_CONFIGURED",
        domain: "MASTRA" /* MASTRA */,
        category: "SYSTEM" /* SYSTEM */,
        text: "Logger is not configured or does not support getLogsByRunId operation",
        details: {
          runId,
          transportId
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    return await this.#logger.getLogsByRunId({
      runId,
      transportId,
      fromDate,
      toDate,
      logLevel,
      filters,
      page,
      perPage
    });
  }
  async getLogs(transportId, params) {
    if (!transportId) {
      const error = new MastraError({
        id: "MASTRA_GET_LOGS_MISSING_TRANSPORT",
        domain: "MASTRA" /* MASTRA */,
        category: "USER" /* USER */,
        text: "Transport ID is required",
        details: {
          transportId
        }
      });
      this.#logger?.trackException(error);
      throw error;
    }
    if (!this.#logger) {
      const error = new MastraError({
        id: "MASTRA_GET_LOGS_LOGGER_NOT_CONFIGURED",
        domain: "MASTRA" /* MASTRA */,
        category: "SYSTEM" /* SYSTEM */,
        text: "Logger is not set",
        details: {
          transportId
        }
      });
      throw error;
    }
    return await this.#logger.getLogs(transportId, params);
  }
  /**
   * Get all registered MCP server instances.
   * @returns A record of MCP server ID to MCPServerBase instance, or undefined if none are registered.
   */
  getMCPServers() {
    return this.#mcpServers;
  }
  /**
   * Get a specific MCP server instance.
   * If a version is provided, it attempts to find the server with that exact logical ID and version.
   * If no version is provided, it returns the server with the specified logical ID that has the most recent releaseDate.
   * The logical ID should match the `id` property of the MCPServer instance (typically set via MCPServerConfig.id).
   * @param serverId - The logical ID of the MCP server to retrieve.
   * @param version - Optional specific version of the MCP server to retrieve.
   * @returns The MCP server instance, or undefined if not found or if the specific version is not found.
   */
  getMCPServer(serverId, version) {
    if (!this.#mcpServers) {
      return void 0;
    }
    const allRegisteredServers = Object.values(this.#mcpServers || {});
    const matchingLogicalIdServers = allRegisteredServers.filter(server => server.id === serverId);
    if (matchingLogicalIdServers.length === 0) {
      this.#logger?.debug(`No MCP servers found with logical ID: ${serverId}`);
      return void 0;
    }
    if (version) {
      const specificVersionServer = matchingLogicalIdServers.find(server => server.version === version);
      if (!specificVersionServer) {
        this.#logger?.debug(`MCP server with logical ID '${serverId}' found, but not version '${version}'.`);
      }
      return specificVersionServer;
    } else {
      if (matchingLogicalIdServers.length === 1) {
        return matchingLogicalIdServers[0];
      }
      matchingLogicalIdServers.sort((a, b) => {
        const dateAVal = a.releaseDate && typeof a.releaseDate === "string" ? new Date(a.releaseDate).getTime() : NaN;
        const dateBVal = b.releaseDate && typeof b.releaseDate === "string" ? new Date(b.releaseDate).getTime() : NaN;
        if (isNaN(dateAVal) && isNaN(dateBVal)) return 0;
        if (isNaN(dateAVal)) return 1;
        if (isNaN(dateBVal)) return -1;
        return dateBVal - dateAVal;
      });
      if (matchingLogicalIdServers.length > 0) {
        const latestServer = matchingLogicalIdServers[0];
        if (latestServer && latestServer.releaseDate && typeof latestServer.releaseDate === "string" && !isNaN(new Date(latestServer.releaseDate).getTime())) {
          return latestServer;
        }
      }
      this.#logger?.warn(`Could not determine the latest server for logical ID '${serverId}' due to invalid or missing release dates, or no servers left after filtering.`);
      return void 0;
    }
  }
  async addTopicListener(topic, listener) {
    await this.#pubsub.subscribe(topic, listener);
  }
  async removeTopicListener(topic, listener) {
    await this.#pubsub.unsubscribe(topic, listener);
  }
  async startEventEngine() {
    for (const topic in this.#events) {
      if (!this.#events[topic]) {
        continue;
      }
      const listeners = Array.isArray(this.#events[topic]) ? this.#events[topic] : [this.#events[topic]];
      for (const listener of listeners) {
        await this.#pubsub.subscribe(topic, listener);
      }
    }
  }
  async stopEventEngine() {
    for (const topic in this.#events) {
      if (!this.#events[topic]) {
        continue;
      }
      const listeners = Array.isArray(this.#events[topic]) ? this.#events[topic] : [this.#events[topic]];
      for (const listener of listeners) {
        await this.#pubsub.unsubscribe(topic, listener);
      }
    }
    await this.#pubsub.flush();
  }
  /**
   * Shutdown Mastra and clean up all resources
   */
  async shutdown() {
    await shutdownAITracingRegistry();
    await this.stopEventEngine();
    this.#logger?.info("Mastra shutdown completed");
  }
};
Mastra = /*@__PURE__*/(_ => {
  _init = __decoratorStart(null);
  Mastra = __decorateElement(_init, 0, "Mastra", _Mastra_decorators, Mastra);
  __runInitializers(_init, 1, Mastra);
  return Mastra;
})();

export { Mastra };
