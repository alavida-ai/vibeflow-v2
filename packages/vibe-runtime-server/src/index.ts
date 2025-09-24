// Load environment variables first using top-level await
import { initEnv } from './env-loader.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createHonoServer } from '@mastra/deployer/server';
import fs from 'node:fs/promises';
import { accessSync } from 'node:fs';
import { compile, type WorkflowInput, type AgentInput, type Manifest } from '@vibeflow/compiler';
import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger } from '@vibeflow/logging';
import { serveStatic } from '@hono/node-server/serve-static';

const log = createLogger({ 
  context: 'cli', 
  name: 'vibe-runtime-server'
});


export async function startServer(
  manifest: Manifest, 
  outDir: string, 
  options: { 
    port?: number; 
    host?: string;
    enablePlayground?: boolean;
    playgroundDistPath?: string;
  } = {}
) {
  await initEnv();
  
  // Now safely import modules that depend on environment variables
  const { createMastra } = await import('@vibeflow/mastra-runtime');
  
  const PORT = options.port || Number(process.env.RUNTIME_SERVER_PORT || process.env.PORT || 4111);
  const HOST = options.host || process.env.RUNTIME_SERVER_HOST || process.env.HOST || 'localhost';
  const PLAYGROUND_ENABLED = options.enablePlayground ?? true;
  
  // Use packaged playground assets or fallback to development path
  const getPlaygroundDistPath = () => {
    if (options.playgroundDistPath) {
      return options.playgroundDistPath;
    }
    
    // Get the directory where this module is located
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Try packaged assets first (for published package)
    const packagedPath = path.resolve(__dirname, '../playground-assets');
    
    // Fallback to development path (for local development)
    const devPath = path.resolve(__dirname, '../../playground/dist');
    
    try {
      // Check if packaged assets exist
      accessSync(packagedPath);
      return packagedPath;
    } catch {
      return devPath;
    }
  };
  
  const PLAYGROUND_DIST_PATH = getPlaygroundDistPath();

  // Load workflows function that can be called to reload
  const loadWorkflows = async (manifest: Manifest) => {
    const workflows: Record<string, WorkflowInput> = {};
    for (const wf of manifest.workflows) {
      const workflowContent = await fs.readFile(path.join(outDir, wf.path), 'utf8');
      workflows[wf.id] = JSON.parse(workflowContent);
    }
    log.info(`Loaded workflows: ${Object.keys(workflows)}`);
    return workflows;
  };

  const loadAgents = async (manifest: Manifest) => {
    const agents: Record<string, AgentInput> = {};
    for (const agent of manifest.agents) {
      const agentContent = await fs.readFile(path.join(outDir, agent.path), 'utf8');
      agents[agent.id] = JSON.parse(agentContent);
    }
    log.info(`Loaded agents: ${Object.keys(agents)}`);
    return agents;
  };

  // Create workflow Hono app from mastra
  const createWorkflowApp = async (manifest: Manifest) => {
    const workflows = await loadWorkflows(manifest);
    log.info(`Loaded workflows: ${Object.keys(workflows)}`);
    const agents = await loadAgents(manifest);
    log.info(`Loaded agents: ${Object.keys(agents)}`);
    const mastra = await createMastra({ workflows, agents });
    return await createHonoServer(mastra, {
      playground: false,  // Disable Mastra's playground - we handle it ourselves
      tools: {},
    }) as unknown as Hono;
  };

  // Initial workflow app
  let workflowApp = await createWorkflowApp(manifest);

  // Create main app - SIMPLE APPROACH
  const app = new Hono();
  
  // 1. STATIC ASSETS FIRST (playground JS/CSS files)
  if (PLAYGROUND_ENABLED) {
    try {
      // Check if playground exists
      await fs.access(path.join(PLAYGROUND_DIST_PATH, 'index.html'));

      log.info(`✅ Serving playground assets from ${PLAYGROUND_DIST_PATH}`);
      
      app.use('/assets/*', serveStatic({
        root: PLAYGROUND_DIST_PATH
      }));
      
      log.info(`✅ Serving playground assets from ${PLAYGROUND_DIST_PATH}`);
    } catch {
      log.warn(`⚠️  Playground not found at ${PLAYGROUND_DIST_PATH}. Run 'npm run build' in packages/playground first.`);
    }
  }

  // 2. SYSTEM ROUTES
  app.get('/health', (c) => c.text('ok'));
  
  // Hot reload endpoint (playground expects this)
  app.get('/refresh-events', (c) => {
    return c.text('data: connected\n\n', 200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  });
  
  // 3. API DOCUMENTATION ROUTES
  const docs = new Hono();
  docs.get('/swagger', swaggerUI({ url: '/openapi.json' }));
  docs.get('/scalar', Scalar({ url: '/openapi.json' }));
  app.route('/docs', docs);

  // 4. ALL API ROUTES (forward to workflow app)
  app.all('/api/*', async (c) => {
    return workflowApp.fetch(c.req.raw);
  });

  // 5. SPA CATCH-ALL (must be LAST)
  if (PLAYGROUND_ENABLED) {
    app.get('*', async (c) => {
      try {
        const indexPath = path.join(PLAYGROUND_DIST_PATH, 'index.html');
        let indexHtml = await fs.readFile(indexPath, 'utf-8');
        
        // Replace template variables
        indexHtml = indexHtml.replace(
          `'%%MASTRA_TELEMETRY_DISABLED%%'`, 
          `${Boolean(process.env.MASTRA_TELEMETRY_DISABLED)}`
        );
        indexHtml = indexHtml.replace(`'%%MASTRA_SERVER_HOST%%'`, `'${HOST}'`);
        indexHtml = indexHtml.replace(`'%%MASTRA_SERVER_PORT%%'`, `'${PORT}'`);
        
        return c.html(indexHtml);
      } catch (error) {
        log.error(`Failed to serve playground: ${error}`);
        return c.text('Playground not available', 404);
      }
    });
    
    log.info(`✅ Playground available at http://${HOST}:${PORT}`);
  } else {
    // If playground disabled, let workflow app handle everything
    app.all('*', async (c) => {
      return workflowApp.fetch(c.req.raw);
    });
  }
  
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
      log.info('🔄 Rebuilding workflow server...');
      workflowApp = await createWorkflowApp(newManifest);
      log.info('✅ Workflow server rebuilt and remounted');
    },
    stop: () => server.close()
  };
}

// If running directly, fall back to old behavior
if (import.meta.url === `file://${process.argv[1]}`) {
  const WORKFLOWS_DIR = process.env.SRC_DIR || '/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/templates/studio';
  const OUT_DIR = process.env.OUT_DIR || '/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/templates/.vibeflow';
  
  const compiledWorkflows = await compile({ srcDir: WORKFLOWS_DIR, outDir: OUT_DIR });
  const { host, port } = await startServer(compiledWorkflows, OUT_DIR, { enablePlayground: true });
  log.info(`Server started at http://${host}:${port}`);
}


