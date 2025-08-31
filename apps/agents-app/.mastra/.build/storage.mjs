// src/storage/constants.ts
var TABLE_WORKFLOW_SNAPSHOT = "mastra_workflow_snapshot";
var TABLE_EVALS = "mastra_evals";
var TABLE_MESSAGES = "mastra_messages";
var TABLE_THREADS = "mastra_threads";
var TABLE_TRACES = "mastra_traces";
var TABLE_RESOURCES = "mastra_resources";
var TABLE_SCORERS = "mastra_scorers";
var TABLE_AI_SPANS = "mastra_ai_spans";
var SCORERS_SCHEMA = {
  id: { type: "text", nullable: false, primaryKey: true },
  scorerId: {
    type: "text"
  },
  traceId: {
    type: "text",
    nullable: true
  },
  runId: {
    type: "text"
  },
  scorer: {
    type: "jsonb"
  },
  preprocessStepResult: {
    type: "jsonb",
    nullable: true
  },
  extractStepResult: {
    type: "jsonb",
    nullable: true
  },
  analyzeStepResult: {
    type: "jsonb",
    nullable: true
  },
  score: {
    type: "float"
  },
  reason: {
    type: "text",
    nullable: true
  },
  metadata: {
    type: "jsonb",
    nullable: true
  },
  preprocessPrompt: {
    type: "text",
    nullable: true
  },
  extractPrompt: {
    type: "text",
    nullable: true
  },
  generateScorePrompt: {
    type: "text",
    nullable: true
  },
  generateReasonPrompt: {
    type: "text",
    nullable: true
  },
  analyzePrompt: {
    type: "text",
    nullable: true
  },
  // Deprecated
  reasonPrompt: {
    type: "text",
    nullable: true
  },
  input: {
    type: "jsonb"
    // MESSAGE INPUT
  },
  output: {
    type: "jsonb"
    // MESSAGE OUTPUT
  },
  additionalContext: {
    type: "jsonb",
    // DATA FROM THE CONTEXT PARAM ON AN AGENT
    nullable: true
  },
  runtimeContext: {
    type: "jsonb",
    // THE EVALUATE RUNTIME CONTEXT FOR THE RUN
    nullable: true
  },
  /**
   * Things you can evaluate
   */
  entityType: {
    type: "text",
    // WORKFLOW, AGENT, TOOL, STEP, NETWORK
    nullable: true
  },
  entity: {
    type: "jsonb",
    // MINIMAL JSON DATA ABOUT WORKFLOW, AGENT, TOOL, STEP, NETWORK
    nullable: true
  },
  entityId: {
    type: "text",
    nullable: true
  },
  source: {
    type: "text"
  },
  resourceId: {
    type: "text",
    nullable: true
  },
  threadId: {
    type: "text",
    nullable: true
  },
  createdAt: {
    type: "timestamp"
  },
  updatedAt: {
    type: "timestamp"
  }
};
var AI_SPAN_SCHEMA = {
  // Composite primary key of traceId and spanId
  traceId: { type: "text", nullable: false },
  spanId: { type: "text", nullable: false },
  parentSpanId: { type: "text", nullable: true },
  name: { type: "text", nullable: false },
  scope: { type: "jsonb", nullable: true },
  // Mastra package info {"core-version": "0.1.0"}
  spanType: { type: "integer", nullable: false },
  // WORKFLOW_RUN, WORKFLOW_STEP, AGENT_RUN, AGENT_STEP, TOOL_RUN, TOOL_STEP, etc.
  attributes: { type: "jsonb", nullable: true },
  metadata: { type: "jsonb", nullable: true },
  links: { type: "jsonb", nullable: true },
  input: { type: "jsonb", nullable: true },
  output: { type: "jsonb", nullable: true },
  error: { type: "jsonb", nullable: true },
  startedAt: { type: "timestamp", nullable: false },
  // When the span started
  endedAt: { type: "timestamp", nullable: true },
  // When the span ended
  createdAt: { type: "timestamp", nullable: false },
  // The time the database record was created
  updatedAt: { type: "timestamp", nullable: true },
  // The time the database record was last updated
  isEvent: { type: "boolean", nullable: false }
};
var TABLE_SCHEMAS = {
  [TABLE_WORKFLOW_SNAPSHOT]: {
    workflow_name: {
      type: "text"
    },
    run_id: {
      type: "text"
    },
    resourceId: { type: "text", nullable: true },
    snapshot: {
      type: "text"
    },
    createdAt: {
      type: "timestamp"
    },
    updatedAt: {
      type: "timestamp"
    }
  },
  [TABLE_SCORERS]: SCORERS_SCHEMA,
  [TABLE_EVALS]: {
    input: {
      type: "text"
    },
    output: {
      type: "text"
    },
    result: {
      type: "jsonb"
    },
    agent_name: {
      type: "text"
    },
    metric_name: {
      type: "text"
    },
    instructions: {
      type: "text"
    },
    test_info: {
      type: "jsonb",
      nullable: true
    },
    global_run_id: {
      type: "text"
    },
    run_id: {
      type: "text"
    },
    created_at: {
      type: "timestamp"
    },
    createdAt: {
      type: "timestamp",
      nullable: true
    }
  },
  [TABLE_THREADS]: {
    id: { type: "text", nullable: false, primaryKey: true },
    resourceId: { type: "text", nullable: false },
    title: { type: "text", nullable: false },
    metadata: { type: "text", nullable: true },
    createdAt: { type: "timestamp", nullable: false },
    updatedAt: { type: "timestamp", nullable: false }
  },
  [TABLE_MESSAGES]: {
    id: { type: "text", nullable: false, primaryKey: true },
    thread_id: { type: "text", nullable: false },
    content: { type: "text", nullable: false },
    role: { type: "text", nullable: false },
    type: { type: "text", nullable: false },
    createdAt: { type: "timestamp", nullable: false },
    resourceId: { type: "text", nullable: true }
  },
  [TABLE_AI_SPANS]: AI_SPAN_SCHEMA,
  [TABLE_TRACES]: {
    id: { type: "text", nullable: false, primaryKey: true },
    parentSpanId: { type: "text", nullable: true },
    name: { type: "text", nullable: false },
    traceId: { type: "text", nullable: false },
    scope: { type: "text", nullable: false },
    kind: { type: "integer", nullable: false },
    attributes: { type: "jsonb", nullable: true },
    status: { type: "jsonb", nullable: true },
    events: { type: "jsonb", nullable: true },
    links: { type: "jsonb", nullable: true },
    other: { type: "text", nullable: true },
    startTime: { type: "bigint", nullable: false },
    endTime: { type: "bigint", nullable: false },
    createdAt: { type: "timestamp", nullable: false }
  },
  [TABLE_RESOURCES]: {
    id: { type: "text", nullable: false, primaryKey: true },
    workingMemory: { type: "text", nullable: true },
    metadata: { type: "jsonb", nullable: true },
    createdAt: { type: "timestamp", nullable: false },
    updatedAt: { type: "timestamp", nullable: false }
  }
};

export { TABLE_WORKFLOW_SNAPSHOT as T, TABLE_EVALS as a, TABLE_MESSAGES as b, TABLE_THREADS as c, TABLE_TRACES as d, TABLE_SCHEMAS as e, TABLE_SCORERS as f, TABLE_RESOURCES as g, TABLE_AI_SPANS as h };
