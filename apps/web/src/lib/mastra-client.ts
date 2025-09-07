import { MastraClient } from "@mastra/client-js";
 
export const mastraClient = new MastraClient({
  baseUrl: process.env.MASTRA_BASE_URL || "http://localhost:4111", // Default Mastra development server port
});