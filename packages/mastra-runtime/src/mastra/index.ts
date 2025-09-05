import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { testWorkflow } from "./workflows/test-workflow";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { twitterFrameworkAnalysisWorkflow } from "./workflows/twitter-framework-analysis";
import { createStorage } from "./storage";
import { frameworkAgent } from "./agents/frameworkAgent";
import { parseAgent } from "./agents/parseAgent";
import { createVibeflowMCP } from "./mcp";

export async function createMastraInstance(options: {
  workflows: Record<string, Workflow>}) {
  return new Mastra({
    agents: {
      frameworkAgent,
      parseAgent
    },
    workflows: {
      testWorkflow,
      businessStrategyWorkflow,
      twitterFrameworkAnalysisWorkflow,
      ...options.workflows
    },
    bundler: {
      transpilePackages: [
        "@vibeflow/ingestion",
        "@vibeflow/agent-sdk",
        "@vibeflow/core"
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
}

