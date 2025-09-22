import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { testWorkflow } from "./workflows/test-workflow";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { extractTweetFrameworksWorkflow } from "./workflows/extract-tweet-frameworks";
import { createStorage } from "./storage";
import { frameworkAgent } from "./agents/frameworkAgent";
import { parseAgent } from "./agents/parseAgent";
import { createVibeflowMCP } from "./mcp";
import { PinoLogger } from "@mastra/loggers";
import { PgVector } from "@mastra/pg";
import { rorySutherlandAgent } from "./agents/rorySutherlandAgent";

export async function createMastraInstance(options?: {
  workflows?: Record<string, Workflow>}): Promise<Mastra> {
  return new Mastra({
    logger: new PinoLogger({
      name: 'VibeFlow-Mastra',
      level: 'debug'
    }),
    agents: {
      frameworkAgent,
      parseAgent,
      rorySutherlandAgent
    },
    workflows: {
      testWorkflow,
      businessStrategyWorkflow,
      extractTweetFrameworksWorkflow,
      ...options?.workflows
      
    },
    vectors: {
      pgVector: new PgVector({ connectionString: process.env.DATABASE_URL! }),
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