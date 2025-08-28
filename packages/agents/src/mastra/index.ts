import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
 
import { headsUpWorkflow } from "./workflows/flow";
import { famousPersonAgent } from "./agents/famousPerson";
import { gameAgent } from "./agents/gameAgent";
import { strategyWorkflow } from "./workflows/strategy";
import { strategyAgent } from "./agents/strategyAgent";
import { storage } from "./memory";
 
export const mastra = new Mastra({
  workflows: { headsUpWorkflow, strategyWorkflow  },
  agents: { famousPersonAgent, gameAgent, strategyAgent },
  storage: storage,
  telemetry: {
    enabled: true,
    export: {
      type: 'otlp',
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      headers: {
        Authorization: `Basic ${process.env.LANGFUSE_AUTH_STRING}`,
      },
    },
  },
});