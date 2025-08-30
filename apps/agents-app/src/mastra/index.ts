import { Mastra } from "@mastra/core/mastra";
import { server } from "./server";
import { testWorkflow } from "./workflows/test-workflow";
import dotenv from "dotenv";
import { RuntimeContext } from "@mastra/core/di";


dotenv.config({path: "/Users/alexandergirardet/Code/vibeflow-projects/brand-listener/apps/agents-app/.env"});

// Define RuntimeContext type
interface WorkflowRuntimeContext {
  currentRunId: string;
  workflowId: string;
};

export const mastra = new Mastra({
  mcpServers: {
       server,
  },
  workflows: {
    testWorkflow,
  },
  bundler: {
    transpilePackages: [
      "@brand-listener/agent-sdk"
    ],
    sourcemap: true,
  }
});

