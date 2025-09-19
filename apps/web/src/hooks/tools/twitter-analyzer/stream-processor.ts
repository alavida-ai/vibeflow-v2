// Pure functions for stream processing - no side effects, easy to test

export interface ParsedEvent {
  type: string;
  payload: any;
  runId?: string;
}

/**
 * Parse raw stream chunk into individual events
 * Uses Record Separator (\x1E) as per Mastra SDK
 */
export function parseStreamChunk(chunk: string, buffer: string = ''): {
  events: ParsedEvent[];
  remainingBuffer: string;
} {
  const fullBuffer = buffer + chunk;
  const parts = fullBuffer.split('\x1E');
  const remainingBuffer = parts.pop() || '';
  const events: ParsedEvent[] = [];
  
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart) {
      try {
        const event = JSON.parse(trimmedPart);
        events.push(event);
      } catch (parseError) {
        console.warn('Failed to parse JSON chunk:', {
          chunk: trimmedPart.substring(0, 100) + (trimmedPart.length > 100 ? '...' : ''),
          error: parseError instanceof Error ? parseError.message : String(parseError),
        });
      }
    }
  }
  
  return { events, remainingBuffer };
}

/**
 * Process final buffer when stream is complete
 */
export function processFinalBuffer(buffer: string): ParsedEvent[] {
  if (!buffer.trim()) return [];
  
  const chunks = buffer.split('\x1E').filter(chunk => chunk.trim());
  const events: ParsedEvent[] = [];
  
  for (const chunk of chunks) {
    try {
      const event = JSON.parse(chunk);
      events.push(event);
    } catch (parseError) {
      console.warn('Failed to parse remaining buffer chunk:', 
        chunk.substring(0, 100) + '...', 
        parseError instanceof Error ? parseError.message : String(parseError)
      );
    }
  }
  
  return events;
}

/**
 * Create analysis stream from API
 */
export async function createAnalysisStream(username: string): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData.error || 'Failed to analyze user');
    throw new Error(errorData.error || 'Failed to analyze user');
  }

  if (!response.body) {
    throw new Error('No response body received');
  }

  return response.body.getReader();
}

/**
 * Read stream with proper error handling and buffer management
 */
export async function* readStream(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<ParsedEvent[], void, unknown> {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        const finalEvents = processFinalBuffer(buffer);
        if (finalEvents.length > 0) {
          yield finalEvents;
        }
        console.log('Stream complete');
        break;
      }

      try {
        const chunk = decoder.decode(value, { stream: true });
        const { events, remainingBuffer } = parseStreamChunk(chunk, buffer);
        buffer = remainingBuffer;

        if (events.length > 0) {
          yield events;
        }
      } catch (chunkError) {
        console.error('Error processing chunk:', chunkError);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
