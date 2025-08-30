import { createHonoServer } from "@mastra/deployer/server";
import { server } from "./server";
import { serve } from "bun";
import { mastra } from "./index";
import { streamSSE } from "hono/streaming";

import { Hono } from "hono";
const app = new Hono();

const makeUrl = (c: any) => new URL(c.req.url, `http://${c.req.header('host')}`);

// const app = await createHonoServer(mastra);

// app.get('/', async (c) => {
//     console.log("received request")
//     return c.text('Hello World')
// })

// app.get('/sse', async (c) => {
//     console.log("received sse request")
//     return streamSSE(c, async (stream) => {
//         server.startHonoSSE({
//             context: c,
//             url: new URL("http://localhost:4112"),
//             ssePath: "/sse",
//             messagePath: "/message",
//         })
//     })
// })

app.get('/health', async (c) => {
    return c.text('Hello World')
})

app.get('/', async (c) => {
    return c.text('Hello World')
})

app.get('/mcp/sse', async (c) => {
    console.log("received sse request")
    console.log("c.header", c.req.header())
    return server.startHonoSSE({
      url: makeUrl(c),
      ssePath: '/mcp/sse',
      messagePath: '/mcp/message',
      context: c,
    }); // <-- returns a Response; just return it
  });


  app.all('/mcp/message', async (c) => {
    console.log("received message request")
    console.log("c.header", c.req.header())
    return server.startHonoSSE({
      url: makeUrl(c),
      ssePath: '/mcp/sse',
      messagePath: '/mcp/message',
      context: c,
    });
  });

serve({
    fetch: app.fetch,
    port: 4112,
    hostname: "localhost",
    idleTimeout: 255,
})

console.log('Server is running on port 4112')