import http from "http";
import { server } from "./server";
 
const httpServer = http.createServer(async (req, res) => {
  await server.startSSE({
    url: new URL(req.url || "", `http://localhost:3000`),
    ssePath: "/sse",
    messagePath: "/message",
    req,
    res,
  });
});
 
httpServer.listen(3000, () => {
  console.log(`HTTP server listening on port 3000`);
});