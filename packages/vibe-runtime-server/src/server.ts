// Load environment variables first using top-level await
import { initEnv } from './env-loader.js';
await initEnv();

// Now safely import modules that depend on environment variables
const { createMastra } = await import('@vibeflow/mastra-runtime');
import fs from 'node:fs/promises';
import path from 'node:path';
const { serve } = await import('@hono/node-server');
const { Hono } = await import('hono');
import type { Context } from 'hono';

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
  
  // Create Hono app
  const app = new Hono();

  // Add health check endpoint
  app.get('/health', (c: Context) => c.text('ok'));

  // Add basic Mastra endpoints (you can expand these as needed)
  app.get('/api/workflows', async (c: Context) => {
    try {
      const workflows = mastra.getWorkflows({ serialized: true });
      return c.json(workflows);
    } catch (error) {
      return c.json({ error: 'Failed to get workflows' }, 500);
    }
  });

  app.get('/api/agents', async (c: Context) => {
    try {
      const agents = mastra.getAgents();
      return c.json(Object.keys(agents));
    } catch (error) {
      return c.json({ error: 'Failed to get agents' }, 500);
    }
  });

  const server = serve({ fetch: app.fetch, port: PORT, hostname: HOST });

  console.log(`Vibeflow runtime server listening on http://${HOST}:${PORT}`);
  return server;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


