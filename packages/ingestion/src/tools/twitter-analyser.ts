import { ingestUserLastTweets, IngestionResult } from "@brand-listener/ingestion";
import { AnalyzerService } from "@brand-listener/core";
import { generateVisualDescription } from "@brand-listener/core";

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

export interface TwitterAnalyserConfig {
  userName: string;
  maxPages?: number;
  apiKey?: string;
  databaseUrl?: string;
}

export interface AnalysisResult {
  success: boolean;
  ingestionResult: IngestionResult;
  mediaProcessed: number;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/*                              CLASS                                         */
/* -------------------------------------------------------------------------- */

export class TwitterAnalyser {
  private readonly userName: string;
  private readonly maxPages: number;
  private readonly apiKey: string;
  private readonly databaseUrl: string;

  constructor(config: TwitterAnalyserConfig) {
    this.userName = config.userName;
    this.maxPages = config.maxPages || 1;
    
    // Use provided credentials or fall back to environment variables
    this.apiKey = config.apiKey || process.env.TWITTER_API_KEY || '';
    this.databaseUrl = config.databaseUrl || process.env.DATABASE_URL || '';
    
    this.validateConfiguration();
  }

  /**
   * Validate that all required configuration is present
   */
  private validateConfiguration(): void {
    if (!this.userName) {
      throw new Error("userName is required");
    }

    if (!this.maxPages) {
      throw new Error("maxPages is required");
    }
    
    if (!this.apiKey) {
      throw new Error("TWITTER_API_KEY is not set");
    }
    
    if (!this.databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
  }

  /**
   * Run the complete Twitter analysis process
   */
  async run(): Promise<AnalysisResult> {
    try {
      console.log(`🚀 Starting Twitter analysis for @${this.userName}`);
      
      // Step 1: Ingest user's last tweets
      const ingestionResult = await this.ingestUserLastTweets();
      
      if (!ingestionResult.success) {
        return {
          success: false,
          ingestionResult,
          mediaProcessed: 0,
          error: ingestionResult.error || 'Ingestion failed'
        };
      }

      console.log(`✅ Ingestion complete: ${ingestionResult.totalTweets} tweets processed`);
      
      // Step 2: Generate media descriptions
      const mediaProcessed = await this.generateMediaDescriptions();
      
      console.log(`✅ Analysis complete: ${mediaProcessed} media items processed`);
      
      return {
        success: true,
        ingestionResult,
        mediaProcessed
      };
      
    } catch (error) {
      console.error('❌ Twitter analysis failed:', error);
      return {
        success: false,
        ingestionResult: {
          success: false,
          totalTweets: 0,
          pagesProcessed: 0,
          hasMorePages: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        mediaProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Ingest the user's last tweets
   */
  private async ingestUserLastTweets(): Promise<IngestionResult> {
    console.log(`📥 Starting tweet ingestion for @${this.userName}`);
    
    const result = await ingestUserLastTweets({
      userName: this.userName,
      maxPages: this.maxPages
    });
    
    return result;
  }

  /**
   * Generate AI descriptions for media content in tweets
   */
  private async generateMediaDescriptions(): Promise<number> {
    console.log(`🎨 Starting media description generation for @${this.userName}`);
    
    const mediaItems = await AnalyzerService.getMediaByAuthorUsername(this.userName);
    
    if (mediaItems.length === 0) {
      console.log("No media items found that need description generation");
      return 0;
    }
    
    console.log(`Found ${mediaItems.length} media items to process`);
    
    // Process all media descriptions in parallel with error handling
    const results = await Promise.allSettled(
      mediaItems.map(async (media: any) => {
        try {
          const description = await generateVisualDescription(media.type, media.url);
          media.description = description;
          media.updatedAt = new Date();
          await AnalyzerService.updateMediaDescriptions(media);
          return true;
        } catch (error) {
          console.error(`❌ Failed to process media ${media.id}:`, error);
          return false;
        }
      })
    );
    
    const successfulProcessing = results.filter(
      (result: any) => result.status === 'fulfilled' && result.value === true
    ).length;
    
    console.log(`✅ Successfully processed ${successfulProcessing} of ${mediaItems.length} media items`);
    
    return successfulProcessing;
  }

  /**
   * Get analysis statistics for the user
   */
  async getAnalysisStats(): Promise<{
    totalTweets: number;
    mediaItems: number;
    processedMedia: number;
  }> {
    const mediaItems = await AnalyzerService.getMediaByAuthorUsername(this.userName);
    const processedMedia = mediaItems.filter((media: any) => media.description).length;
    
    // Note: Getting total tweets would require a new method in AnalyzerService
    // For now, we'll return the media stats
    return {
      totalTweets: 0, // Would need AnalyzerService.getTweetCountByUsername(this.userName)
      mediaItems: mediaItems.length,
      processedMedia
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                              UTILITY FUNCTIONS                            */
/* -------------------------------------------------------------------------- */

/**
 * Create and run a Twitter analyser with environment variables
 */
export async function createAndRunTwitterAnalyser(
  userName?: string,
  maxPages?: number
): Promise<AnalysisResult> {
  const targetUserName = userName || process.env.TWITTER_USERNAME;
  
  if (!targetUserName) {
    throw new Error("userName must be provided or TWITTER_USERNAME environment variable must be set");
  }
  
  const analyser = new TwitterAnalyser({
    userName: targetUserName,
    maxPages
  });
  
  return await analyser.run();
}

/**
 * Main function for standalone execution
 */
export async function main(): Promise<void> {
  const result = await createAndRunTwitterAnalyser(
    "Send"
  );
  
  if (result.success) {
    console.log("✅ Twitter analysis completed successfully");
    console.log(`📊 Summary: ${result.ingestionResult.totalTweets} tweets, ${result.mediaProcessed} media processed`);
  } else {
    console.error("❌ Twitter analysis failed:", result.error);
    throw new Error(result.error);
  }
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Load environment variables when running locally
  const { config } = await import('dotenv');
  config({path: "/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/.env"});
    
  main()
    .then(() => {
      console.log("✅ Main process finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Main process failed:", error);
      process.exit(1);
    });
}