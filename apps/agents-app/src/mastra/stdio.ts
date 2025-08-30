import { server } from "./server";

server.startStdio().catch((error) => {
    console.error("Error running MCP server:", error);
    process.exit(1);
  });