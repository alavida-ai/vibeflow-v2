import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { PgVector } from "@mastra/pg";
import { createVectorQueryTool, MDocument } from "@mastra/rag";
import { loadEpubForRAG } from "./epub-loader";
import * as fs from "fs";
import * as path from "path";

/**
 * Create a document from an EPUB file
 * @param filePath - Path to the EPUB file
 * @returns Promise<MDocument> - Document ready for RAG processing
 */
export async function createDocumentFromEpub(filePath: string): Promise<MDocument> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`EPUB file not found: ${filePath}`);
  }

  const text = await loadEpubForRAG(filePath);
  return MDocument.fromText(text);
}

/**
 * Process an EPUB file and store it in the vector database
 * @param epubPath - Path to the EPUB file
 * @param indexName - Name for the vector index (default: "embeddings")
 * @returns Promise<void>
 */
export async function processEpubBook(
  epubPath: string, 
  indexName: string = "embeddings"
): Promise<void> {
  try {
    // 1. Create document from EPUB
    const doc = await createDocumentFromEpub(epubPath);
    
    // 2. Create chunks
    const chunks = await doc.chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50,
    });
    
    // 3. Generate embeddings
    const { embeddings } = await embedMany({
      values: chunks.map((chunk) => chunk.text),
      model: openai.embedding("text-embedding-3-small"),
    });

    
    
    // 4. Store in vector database
    const pgVector = new PgVector({
      connectionString: process.env.DATABASE_URL!,
    });

    await pgVector.upsert({
      indexName,
      vectors: embeddings,
      metadata: chunks.map((chunk) => ({
        text: chunk.text, // The original text content
        id: chunk.metadata.id, // Optional unique identifier
      })),
      });
    
    console.log(`Successfully processed EPUB: ${path.basename(epubPath)}`);
    console.log(`Created ${chunks.length} chunks and stored in index: ${indexName}`);
    
  } catch (error) {
    console.error(`Failed to process EPUB ${epubPath}:`, error);
    throw error;
  }
}

// Example usage for text documents (existing functionality)
// 1. Initialize document
const doc = await createDocumentFromEpub("/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/packages/mastra-runtime/src/mastra/rag/book.epub");

// 2. Create chunks
const chunks = await doc.chunk({
  strategy: "recursive",
  size: 512,
  overlap: 50,
});
 
// 3. Generate embeddings; we need to pass the text of each chunk
const { embeddings } = await embedMany({
  values: chunks.map((chunk: any) => chunk.text),
  model: openai.embedding("text-embedding-3-small"),
});
 
// 4. Store in vector database
const pgVector = new PgVector({
  connectionString: process.env.DATABASE_URL!,
});

const indexName = "embeddings";
const dimension = 1536;
console.log(`Creating index: ${indexName}`);

console.log(`Checking if index exists: ${indexName}`);

await pgVector.createIndex({
  indexName,
  dimension,
});

console.log(`Upserting vectors into index: ${indexName}`);

await pgVector.upsert({
  indexName,
  vectors: embeddings,
  metadata: chunks.map((chunk) => ({
    text: chunk.text, // The original text content
    id: chunk.metadata.id, // Optional unique identifier
  })),
}); // using an index name of 'embeddings'

console.log(`Vectors upserted into index: ${indexName}`);