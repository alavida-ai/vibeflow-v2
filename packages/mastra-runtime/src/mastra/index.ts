import { Mastra } from "@mastra/core/mastra";
import { Workflow } from "@mastra/core/workflows";
import { createStorage } from "./storage";
import { frameworkAgent } from "./agents/frameworkAgent";
import { createVibeflowMCP } from "./mcp";

export async function createMastraInstance(options: {
  workflows: Record<string, Workflow>}) {
  return new Mastra({
    agents: {
      frameworkAgent
    },
    workflows: {
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

