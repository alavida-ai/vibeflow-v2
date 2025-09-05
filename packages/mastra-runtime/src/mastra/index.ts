import { Mastra } from "@mastra/core/mastra";
import { testWorkflow } from "./workflows/test-workflow";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { twitterFrameworkAnalysisWorkflow } from "./workflows/twitter-framework-analysis";
import { createStorage } from "./storage";
import { frameworkAgent } from "./agents/frameworkAgent";
import { parseAgent } from "./agents/parseAgent";
import { createVibeflowMCP } from "./mcp";

export const mastra = new Mastra({
  agents: {
    frameworkAgent,
    parseAgent
  },
  workflows: {
    testWorkflow,
    businessStrategyWorkflow,
    twitterFrameworkAnalysisWorkflow,
  },
  bundler: {
    transpilePackages: [
      "@brand-listener/ingestion",
      "@brand-listener/agent-sdk",
      "@brand-listener/core"
    ],
    sourcemap: true,
  },
  mcpServers: {
    vibeflow: await createVibeflowMCP(),
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

