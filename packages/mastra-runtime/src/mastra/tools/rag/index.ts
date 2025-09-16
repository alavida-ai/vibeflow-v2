import { createVectorQueryTool } from "@mastra/rag";
import { openai } from "@ai-sdk/openai";

export  const vectorQueryTool: ReturnType<typeof createVectorQueryTool> = createVectorQueryTool({
    vectorStoreName: "pgVector",
    indexName: "embeddings",
    model: openai.embedding("text-embedding-3-small"),
  });