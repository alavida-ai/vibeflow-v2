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

const app: any = await createHonoServer(mastra);

export default app;
