// Load environment variables first using top-level await
import { initEnv } from './env-loader.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createHonoServer } from '@mastra/deployer/server';
import fs from 'node:fs/promises';
import { compile, type WorkflowInput, type Manifest } from '@vibeflow/compiler';
import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';
import path from 'node:path';

export async function startServer(manifest: Manifest, outDir: string, options: { port?: number; host?: string } = {}) {
  await initEnv();
  
  // Now safely import modules that depend on environment variables
  const { createMastra } = await import('@vibeflow/mastra-runtime');
  
  const PORT = options.port || Number(process.env.RUNTIME_SERVER_PORT || process.env.PORT || 4111);
  const HOST = options.host || process.env.RUNTIME_SERVER_HOST || process.env.HOST || 'localhost';

  // Load workflows function that can be called to reload
  const loadWorkflows = async (manifest: Manifest) => {
    console.log('Loading workflows from manifest:', manifest);
    const workflows: Record<string, WorkflowInput> = {};
    for (const wf of manifest.workflows) {
      const workflowContent = await fs.readFile(path.join(outDir, wf.path), 'utf8');
      workflows[wf.id] = JSON.parse(workflowContent);
    }
    console.log('Loaded workflows:', Object.keys(workflows));
    return workflows;
  };

  // Create workflow Hono app from mastra
  const createWorkflowApp = async (manifest: Manifest) => {
    const workflows = await loadWorkflows(manifest);
    const mastra = await createMastra({ workflows });
    return await createHonoServer(mastra) as unknown as Hono;
  };

  // Initial workflow app
  let workflowApp = await createWorkflowApp(manifest);

  const docs = new Hono();
  docs.get('/swagger', swaggerUI({ url: '/openapi.json' }));
  docs.get('/scalar', Scalar({ url: '/openapi.json' }));

  // Create main app that can dynamically route to the current workflow app
  const app = new Hono();
  app.get('/health', (c) => c.text('ok'));
  app.route('/docs', docs);

  // Route all other requests to the current workflow app
  app.all('*', async (c) => {
    return workflowApp.fetch(c.req.raw);
  });
  
  const server = serve({ 
    fetch: app.fetch, 
    port: PORT, 
    hostname: HOST 
  });
  
  return { 
    port: PORT, 
    host: HOST, 
    server,
    reloadWorkflows: async (newManifest: Manifest) => {
      console.log('🔄 Rebuilding workflow server...');
      workflowApp = await createWorkflowApp(newManifest);
      console.log('✅ Workflow server rebuilt and remounted');
    },
    stop: () => server.close()
  };
}

// If running directly, fall back to old behavior
if (import.meta.url === `file://${process.argv[1]}`) {
  // Find project root and use appropriate paths
  const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), '../..');
  const WORKFLOWS_DIR = process.env.SRC_DIR || path.join(projectRoot, 'templates/studio/workflows');
  const OUT_DIR = process.env.OUT_DIR || path.join(projectRoot, 'templates/.vibeflow');
  
  console.log(`📁 Project root: ${projectRoot}`);
  console.log(`📂 Workflows directory: ${WORKFLOWS_DIR}`);
  console.log(`📤 Output directory: ${OUT_DIR}`);
  
  const compiledWorkflows = await compile({ srcDir: WORKFLOWS_DIR, outDir: OUT_DIR });
  await startServer(compiledWorkflows, OUT_DIR);
}


