import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { notes } from "./mcp/test";
import { headsUpWorkflow } from "./workflows/flow";
import { famousPersonAgent } from "./agents/famousPerson";
import { gameAgent } from "./agents/gameAgent";
import { strategyWorkflow } from "./workflows/strategy";
import { strategyAgent } from "./agents/strategyAgent";
import { storage } from "./memory";
import { testWorkflow } from "./workflows/test-workflow";
 
export const mastra = new Mastra({
  workflows: { headsUpWorkflow, strategyWorkflow, testWorkflow },
  agents: { famousPersonAgent, gameAgent, strategyAgent },
  storage: storage,
  // mcpServers: {
  //   notes,
  // },
  // telemetry: {
  //   enabled: true,
  //   export: {
  //     type: 'otlp',
  //     endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  //     headers: {
  //       Authorization: `Basic ${process.env.LANGFUSE_AUTH_STRING}`,
  //     },
  //   },
  // },
});