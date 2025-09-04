// Load environment variables first using top-level await
import { initEnv } from './env-loader.js';
await initEnv();

// Now safely import modules that depend on environment variables
const { createHonoServer } = await import('@mastra/deployer/server');
const { createMastra } = await import('@vibeflow/mastra-runtime');
import fs from 'node:fs/promises';
import path from 'node:path';
const { serve } = await import('@hono/node-server');

const WORKFLOWS_DIR = process.env.WORKFLOWS_DIR || '.vibeflow';
const PORT = Number(process.env.RUNTIME_SERVER_PORT || process.env.PORT || 4111);
const HOST = process.env.RUNTIME_SERVER_HOST || process.env.HOST || 'localhost';

// Simple workflow loader for the server
async function loadCompiledWorkflows(workflowsDir: string): Promise<Record<string, any>> {
  try {
    const outDir = path.resolve(workflowsDir);
    const manifestPath = path.join(outDir, 'manifest.json');
    const manifestRaw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw) as { workflows: { id: string; path: string }[] };
    
    if (!manifest || !Array.isArray(manifest.workflows)) return {};

    const workflows: Record<string, any> = {};
    
    for (const wf of manifest.workflows) {
      const workflowPath = path.join(outDir, wf.path);
      const workflowRaw = await fs.readFile(workflowPath, 'utf8');
      const workflowData = JSON.parse(workflowRaw);
      workflows[workflowData.id] = workflowData; // Store the raw workflow spec for now
    }
    
    return workflows;
  } catch (error) {
    console.warn(`Failed to load compiled workflows from ${workflowsDir}:`, error);
    return {};
  }
}

async function main() {
  // Load compiled workflows from the .vibeflow directory
  const compiledWorkflows = await loadCompiledWorkflows(WORKFLOWS_DIR);

  // Create mastra instance with compiled workflows
  const mastra = await createMastra({
    workflows: compiledWorkflows
  });
  
  const app = await createHonoServer(mastra);

  app.get('/health', (c) => c.text('ok'));

 const server = serve({ fetch: app.fetch, port: PORT, hostname: HOST });

  console.log(`Vibeflow runtime server listening on http://${HOST}:${PORT}`);
  return server;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


