# EPUB RAG Integration

This module provides functionality to load EPUB books and integrate them with the Mastra RAG (Retrieval Augmented Generation) system.

## Features

- ✅ Extract text content from EPUB files
- ✅ Preserve metadata (title, author, description, etc.)
- ✅ Support for chapter-based extraction
- ✅ Integration with Mastra's MDocument system
- ✅ Automatic chunking and embedding generation
- ✅ Vector database storage with PostgreSQL

## Installation

The required dependencies are already included in the package:

```json
{
  "epub2": "^3.0.2",
  "@types/epub2": "^3.0.1"
}
```

## Quick Start

### 1. Basic EPUB Processing

```typescript
import { processEpubBook } from "./rag/index";

// Process an EPUB and store in vector database
await processEpubBook("./path/to/book.epub", "my-book-index");
```

### 2. Extract Text Only

```typescript
import { loadEpubToText } from "./rag/epub-loader";

// Extract text and metadata
const content = await loadEpubToText("./book.epub", {
  includeChapters: true,
  preserveFormatting: true,
});

console.log(content.metadata.title);
console.log(content.text);
```

### 3. Create MDocument for Custom Processing

```typescript
import { createDocumentFromEpub } from "./rag/index";

// Create MDocument for manual processing
const doc = await createDocumentFromEpub("./book.epub");

const chunks = await doc.chunk({
  strategy: "recursive",
  size: 1000,
  overlap: 100,
});
```

### 4. Query the Processed Book

```typescript
import { createVectorQueryTool } from "@mastra/rag";
import { openai } from "@ai-sdk/openai";

// Create query tool after processing
const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "my-book-index",
  model: openai.embedding("text-embedding-3-small"),
});

// Use in your Mastra workflows to query the book content
```

## API Reference

### `processEpubBook(epubPath, indexName?)`

Processes an EPUB file and stores it in the vector database.

**Parameters:**
- `epubPath` (string): Path to the EPUB file
- `indexName` (string, optional): Name for the vector index (default: "embeddings")

**Returns:** `Promise<void>`

### `createDocumentFromEpub(filePath)`

Creates an MDocument from an EPUB file.

**Parameters:**
- `filePath` (string): Path to the EPUB file

**Returns:** `Promise<MDocument>`

### `loadEpubToText(filePath, options?)`

Extracts text content from an EPUB file.

**Parameters:**
- `filePath` (string): Path to the EPUB file
- `options` (object, optional):
  - `includeChapters` (boolean): Include chapter breakdown (default: true)
  - `preserveFormatting` (boolean): Preserve basic formatting (default: false)

**Returns:** `Promise<EpubContent>`

### `loadEpubForRAG(filePath)`

Loads EPUB and formats text for RAG processing.

**Parameters:**
- `filePath` (string): Path to the EPUB file

**Returns:** `Promise<string>` - Plain text with metadata header

## Environment Setup

Make sure you have the following environment variables set:

```bash
DATABASE_URL="postgresql://..."  # Your PostgreSQL connection string
```

## Supported Formats

- ✅ EPUB 2.0
- ✅ EPUB 3.0
- ✅ Most EPUB files with standard structure

## Error Handling

The module includes comprehensive error handling for:
- Invalid EPUB files
- Missing files
- Corrupt chapter content
- Database connection issues

## Example Workflow Integration

```yaml
# Example workflow using EPUB processing
id: "book-analysis"
description: "Analyze an EPUB book and answer questions"
steps:
  - name: "load_book"
    prompt: "Load the EPUB book from {{epub_path}} and process it for RAG"
    acceptance_criteria:
      - "Book is successfully loaded and chunked"
      - "Vector embeddings are stored in database"
  
  - name: "analyze_content"
    prompt: "Analyze the book content and provide a summary"
    acceptance_criteria:
      - "Summary covers main themes and topics"
      - "Key concepts are identified"
```

## Performance Considerations

- Large EPUB files (>10MB) may take several minutes to process
- Chunking strategy affects query performance
- Consider using larger chunk sizes (1000-2000 tokens) for books
- Vector database indexing improves over time with more content

## Troubleshooting

### Common Issues

1. **"Failed to parse EPUB" error**
   - Ensure the file is a valid EPUB format
   - Check file permissions

2. **Database connection errors**
   - Verify `DATABASE_URL` environment variable
   - Ensure PostgreSQL is running

3. **Memory issues with large books**
   - Process books in smaller chunks
   - Consider streaming processing for very large files

### Debug Mode

Enable debug logging by setting:

```typescript
process.env.DEBUG = "epub-loader";
```
