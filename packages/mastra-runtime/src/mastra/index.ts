import { Mastra } from "@mastra/core/mastra";
import { testWorkflow } from "./workflows/test-workflow";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { createStorage } from "./storage";
import { frameworkAgent } from "./agents/frameworkAgent";

export const mastra = new Mastra({
  agents: {
    frameworkAgent
  },
  workflows: {
    testWorkflow,
    businessStrategyWorkflow,
  },
  bundler: {
    transpilePackages: [
      "@brand-listener/ingestion",
      "@brand-listener/agent-sdk",
      "@brand-listener/core"
    ],
    sourcemap: true,
  },
  server: {
    port: 4111,
    host: "localhost",
    build: {
      openAPIDocs: true,
    },
  },
  storage: createStorage()
});

