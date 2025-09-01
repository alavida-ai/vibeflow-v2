import { Mastra } from "@mastra/core/mastra";
import { server } from "./server";
import { testWorkflow } from "./workflows/test-workflow";
import dotenv from "dotenv";

dotenv.config({path: "/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/.env"});

export const mastra = new Mastra({
  mcpServers: {
       server,
  },
  workflows: {
    testWorkflow,
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
  },
});

