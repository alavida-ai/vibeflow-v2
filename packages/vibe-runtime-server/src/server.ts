// Load environment variables first using top-level await
import { initEnv } from './env-loader.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createHonoServer } from '@mastra/deployer/server';
import fs from 'node:fs/promises';
import { compile, type WorkflowInput } from '@vibeflow/compiler';
import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';


import path from 'node:path';

await initEnv();

// Now safely import modules that depend on environment variables
const { createMastra } = await import('@vibeflow/mastra-runtime');

const WORKFLOWS_DIR = process.env.SRC_DIR || '/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/templates/studio/workflows';
const OUT_DIR = process.env.OUT_DIR || '/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/templates/.vibeflow';
const PORT = Number(process.env.RUNTIME_SERVER_PORT || process.env.PORT || 4111);
const HOST = process.env.RUNTIME_SERVER_HOST || process.env.HOST || 'localhost';

const compiledWorkflows = await compile({ srcDir: WORKFLOWS_DIR, outDir: OUT_DIR });

console.log('Manifest Workflows', compiledWorkflows);

// Load all workflow files with type safety
const workflows: Record<string, WorkflowInput> = {};
for (const wf of compiledWorkflows.workflows) {
  const workflowContent = await fs.readFile(path.join(OUT_DIR, wf.path), 'utf8');
  workflows[wf.id] = JSON.parse(workflowContent);
}

console.log('Loaded workflows:', Object.keys(workflows));

// Create mastra instance with compiled workflows
const mastra = await createMastra({
  workflows: workflows
});

const honoApp = await createHonoServer(mastra) as unknown as Hono;
// Create Hono app
const app = new Hono();

const docs = new Hono();

docs.get('/swagger', swaggerUI({ url: '/openapi.json' }));
docs.get('/scalar', Scalar({ url: '/openapi.json' }));

// Add health check endpoint
app.get('/health', (c) => c.text('ok'));

app.route('/docs', docs);

app.route('/', honoApp);
serve({ fetch: app.fetch, port: PORT, hostname: HOST });


