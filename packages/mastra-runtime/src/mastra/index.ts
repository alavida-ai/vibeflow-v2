import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { extractTweetFrameworksWorkflow } from "./workflows/extract-tweet-frameworks";
import { createStorage } from "./storage";
import { twitterAnalyzerAgent } from "./agents/twitter-analyzer";
import { createVibeflowMCP } from "./mcp";
import { PinoLogger } from "@mastra/loggers";
import { strategyAgent } from "./agents/strategyAgent";
import { Agent } from "@mastra/core/agent";

export async function createMastraInstance(options?: {
  workflows?: Record<string, Workflow>,
  agents?: Record<string, Agent>
}): Promise<Mastra> {
  return new Mastra({
    logger: new PinoLogger({
      name: 'VibeFlow-Mastra',
      level: 'debug'
    }),
    agents: {
      twitterAnalyzerAgent,
      strategyAgent,
      ...options?.agents
    },
    workflows: {
      businessStrategyWorkflow,
      extractTweetFrameworksWorkflow,
      ...options?.workflows
      
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
    storage: createStorage(),
    telemetry: {
      enabled: true
    }
  });
}

export const mastra: Mastra = await createMastraInstance();