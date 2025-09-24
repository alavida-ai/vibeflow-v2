import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { createStorage } from "./storage";
import { twitterAnalyzerAgent } from "./agents/twitter-analyzer-agent";
import { createVibeflowMCP, createTwitterScraperMCP } from "./mcp/servers";
import { PinoLogger } from "@mastra/loggers";
import { strategyAgent } from "./agents/strategyAgent";
import { Agent } from "@mastra/core/agent";
import { createCliTransport } from "@vibeflow/logging";
import { createCustomTransport } from "@mastra/core/logger";

const transportFactory = createCliTransport('VibeFlow-Mastra');
const pinoStream = await transportFactory({});
const transport = createCustomTransport(pinoStream);

export async function createMastraInstance(options?: {
  workflows?: Record<string, Workflow>,
  agents?: Record<string, Agent>
}): Promise<Mastra> {
  return new Mastra({
    logger: new PinoLogger({
      name: 'VibeFlow-Mastra',
      transports: { cli: transport },
      level: 'debug'
    }),
    agents: {
      twitterAnalyzerAgent,
      strategyAgent,
      ...options?.agents
    },
    workflows: {
      businessStrategyWorkflow,
      ...options?.workflows
      
    },
    bundler: {
      transpilePackages: [
        "@vibeflow/ingestion",
        "@vibeflow/agent-sdk",
        "@vibeflow/media-utils",
        "@vibeflow/core"
      ],
      sourcemap: true
    },
    mcpServers: {
      vibeflow: await createVibeflowMCP(),
      twitter: await createTwitterScraperMCP()
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