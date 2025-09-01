import dotenv from "dotenv";
dotenv.config({path: "/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/.env"});

import { Mastra } from "@mastra/core/mastra";
import { server } from "./server";
import { testWorkflow } from "./workflows/test-workflow";
import { createStorage } from "./storage";

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
  storage: createStorage()
});

