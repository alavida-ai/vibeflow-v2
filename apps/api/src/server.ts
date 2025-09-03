import { Hono } from 'hono';
import { Scalar } from '@scalar/hono-api-reference';
import { swaggerUI } from '@hono/swagger-ui';
import { createHonoServer } from '@mastra/deployer/server';
import { serve } from 'bun';

import { createMastra, createMCPServer  } from '@brand-listener/mastra-runtime';

// Build Mastra (apps/web/etc can reuse this package)
const mastra = createMastra();

const mastraApp = await createHonoServer(mastra);
const mcpServer = await createMCPServer();


// Build the Mastra Hono app and mount it

const app = new Hono();

// Your API routes first
app.get('/health', (c) => c.text('ok'));
app.get('/ui/docs', swaggerUI({ url: '/openapi.json' }));
app.get('/ui/scalar', Scalar({ url: '/openapi.json' }));

// Mount Mastra under a namespace
app.route('/', mastraApp);

serve({ fetch: app.fetch, port: 4111, hostname: 'localhost' });
console.log('API server running on http://localhost:4111');


