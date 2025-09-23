import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { businessStrategyWorkflow } from "./workflows/business-strategy";
import { extractTweetFrameworksWorkflow } from "./workflows/extract-tweet-frameworks";
import { createStorage } from "./storage";
import { frameworkAgent } from "./agents/frameworkAgent";
import { parseAgent } from "./agents/parseAgent";
import { createVibeflowMCP } from "./mcp";
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
      level: 'error'
    }),
    agents: {
      frameworkAgent,
      parseAgent,
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