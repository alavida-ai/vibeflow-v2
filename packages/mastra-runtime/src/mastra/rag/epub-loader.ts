// Using dynamic import to handle epub2 library correctly
import { promisify } from 'util';

export interface EpubMetadata {
  title?: string;
  creator?: string;
  description?: string;
  publisher?: string;
  date?: string;
  language?: string;
}

export interface EpubContent {
  text: string;
  metadata: EpubMetadata;
  chapters?: Array<{
    title: string;
    text: string;
  }>;
}

/**
 * Extract text content from an EPUB file
 * @param filePath - Path to the EPUB file
 * @param options - Configuration options for text extraction
 * @returns Promise<EpubContent> - Extracted text and metadata
 */
export async function loadEpubToText(
  filePath: string,
  options: {
    includeChapters?: boolean;
    preserveFormatting?: boolean;
  } = {}
): Promise<EpubContent> {
  const { includeChapters = true, preserveFormatting = false } = options;

  return new Promise(async (resolve, reject) => {
    try {
      // Dynamic import to handle epub2 library correctly
      const EPub = (await import('epub2')).default;
      const epub = new EPub(filePath);
    
      epub.on('error', (error: Error) => {
        reject(new Error(`Failed to parse EPUB: ${error.message}`));
      });

      epub.on('end', async () => {
      try {
        const metadata: EpubMetadata = {
          title: epub.metadata.title,
          creator: epub.metadata.creator,
          description: epub.metadata.description,
          publisher: epub.metadata.publisher,
          date: epub.metadata.date,
          language: epub.metadata.language,
        };

        const chapters: Array<{ title: string; text: string }> = [];
        let fullText = '';

        // Get chapter list from the spine
        const getChapterAsync = promisify(epub.getChapter.bind(epub));
        
        for (const spineItem of epub.spine.contents) {
          try {
            if (!spineItem.id) continue;
            
            const chapterContent = await getChapterAsync(spineItem.id);
            
            // Extract text from HTML content
            const textContent = extractTextFromHtml(chapterContent || '', preserveFormatting);
            
            if (textContent.trim()) {
              fullText += textContent + '\n\n';
              
              if (includeChapters) {
                chapters.push({
                  title: spineItem.title || `Chapter ${chapters.length + 1}`,
                  text: textContent,
                });
              }
            }
          } catch (chapterError) {
            console.warn(`Failed to extract chapter ${spineItem.id}:`, chapterError);
          }
        }

        const result: EpubContent = {
          text: fullText.trim(),
          metadata,
        };

        if (includeChapters) {
          result.chapters = chapters;
        }

        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to extract EPUB content: ${error}`));
      }
      });

      epub.parse();
    } catch (error) {
      reject(new Error(`Failed to initialize EPUB parser: ${error}`));
    }
  });
}

/**
 * Extract plain text from HTML content
 * @param html - HTML content
 * @param preserveFormatting - Whether to preserve basic formatting
 * @returns Plain text content
 */
function extractTextFromHtml(html: string, preserveFormatting: boolean = false): string {
  if (!html) return '';

  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  if (preserveFormatting) {
    // Preserve some basic formatting
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  }

  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  text = text.replace(/\s+\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Load EPUB and create MDocument-compatible text
 * @param filePath - Path to the EPUB file
 * @returns Promise<string> - Plain text suitable for MDocument.fromText()
 */
export async function loadEpubForRAG(filePath: string): Promise<string> {
  const epubContent = await loadEpubToText(filePath, {
    includeChapters: false,
    preserveFormatting: true,
  });

  // Add metadata as context at the beginning
  let text = '';
  if (epubContent.metadata.title) {
    text += `Title: ${epubContent.metadata.title}\n`;
  }
  if (epubContent.metadata.creator) {
    text += `Author: ${epubContent.metadata.creator}\n`;
  }
  if (epubContent.metadata.description) {
    text += `Description: ${epubContent.metadata.description}\n`;
  }
  
  if (text) {
    text += '\n---\n\n';
  }

  text += epubContent.text;
  
  return text;
}
