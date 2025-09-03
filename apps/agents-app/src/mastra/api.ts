import { getMCPServer } from "./mcp";
import { mastra } from "./index";
import { createHonoServer } from "@mastra/deployer/server";
import { Scalar } from '@scalar/hono-api-reference'
import { swaggerUI } from "@hono/swagger-ui";
import { serve } from "bun"; // requires bun runtime
import { Hono } from "hono";
import { getMCPClient } from "./mcp/client";

const mastraApp = await createHonoServer(mastra, {
  playground: false,
  tools: {
    ...(await getMCPClient().getTools()),
  },
});
const mcpServer = await getMCPServer();

// Outer router to ensure our routes are evaluated BEFORE any internal catch-alls
const app = new Hono();

const makeUrl = (c: any) => new URL(c.req.url, `http://${c.req.header('host')}`);

app.get('/health', async (c: any) => {
    return c.text('ok')
})

app.get('/', async (c: any) => {
    return c.text('Hello World')
})

// Docs UIs (served before Mastra app so they aren't shadowed by catch-alls)
app.get('/ui/docs', swaggerUI({ url: '/openapi.json' }));
app.get('/ui/scalar', Scalar({ url: '/openapi.json' }));

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

// Mount Mastra app last so its internal routes/catch-alls don't override our UI
app.route('/', mastraApp);

serve({
    fetch: app.fetch,
    port: 4111,
    hostname: "localhost",
    idleTimeout: 255,
})

console.log('Server is running on port 4111')