// import { Hono } from 'hono'
// import { server } from './server'
// import { IncomingMessage, ServerResponse } from 'http'

// const app = new Hono()

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })
// app.post('/mcp', async (c) => {
//   await server.startHonoSSE({
//     url: new URL(c.req.url || '', 'http://localhost:1234'),
//     ssePath: '/sse',
//     messagePath: '/message',
//     context: c,
//   });
// });

// export default app

import { Mastra } from "@mastra/core/mastra";
import { createHonoServer } from '@mastra/deployer/server';
 
import { server } from "./server";

export const mastra = new Mastra({
  mcpServers: {
       server,
  },
  // mcpServers: {
  //   notes,
  // },
  // telemetry: {
  //   enabled: true,
  //   export: {
  //     type: 'otlp',
  //     endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  //     headers: {
  //       Authorization: `Basic ${process.env.LANGFUSE_AUTH_STRING}`,
  //     },
  //   },
  // },
});

const app = await createHonoServer(mastra, {
  isDev: true,
  tools: {
    ...server.tools,
  },
});

export default app;

