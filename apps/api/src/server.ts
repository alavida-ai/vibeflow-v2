import { Hono } from 'hono';
import { serve } from '@hono/node-server'
// routes
import { mastraApp } from './routes/mastra';
import { docs } from './routes/docs';

import { createVibeflowMCP } from '@vibeflow/mastra-runtime';



const mcpServer = await createVibeflowMCP();

const makeUrl = (c: any) => new URL(c.req.url, `http://${c.req.header('host')}`);


const app = new Hono();


app.get('/mcp/sse', async (c: any) => {
    return mcpServer.startHonoSSE({
      url: makeUrl(c),
      ssePath: '/mcp/sse',
      messagePath: '/mcp/message',
      context: c,
    });
});

app.all('/mcp/message', async (c: any) => {
    return mcpServer.startHonoSSE({
      url: makeUrl(c),
      ssePath: '/mcp/sse',
      messagePath: '/mcp/message',
      context: c,
    });
});


// Build the Mastra Hono app and mount it


// Your API routes first
app.get('/health', (c) => c.text('ok'));
// Mount Mastra under a namespace

app.route('/docs', docs);

app.route('/', mastraApp);

serve({ fetch: app.fetch, port: 4111, hostname: 'localhost' });
console.log('API server running on http://localhost:4111');


