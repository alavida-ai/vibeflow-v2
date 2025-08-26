import { TwitterClient } from "./client/twitter";
import { TwitterTransformer } from "./transformer";
import { TwitterDatabaseService } from "@brand-listener/core";

const TWITTER_API_KEY = 'd074cc3ac812460ca73cb6b8dd886b18';


export namespace BrandListenerIngestionService {

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

export interface BrandListenerConfig {
    userName: string;
    sinceTime: Date;
    maxPages?: number;
    cursor?: string;
  }
  
  export interface IngestionResult {
    success: boolean;
    totalTweets: number;
    pagesProcessed: number;
    nextCursor?: string;
    hasMorePages: boolean;
    error?: string;
  }
  
  /* -------------------------------------------------------------------------- */
  /*                              FUNCTIONS                                     */
  /* -------------------------------------------------------------------------- */

  export async function ingestMentions(config: BrandListenerConfig): Promise<IngestionResult> {
    const { 
      userName, 
      sinceTime, 
      maxPages = 100, 
      cursor: initialCursor 
    } = config;

    try {
      const client = new TwitterClient(TWITTER_API_KEY);
      
      let cursor: string | undefined = initialCursor;
      let hasNextPage = true;
      let pageCount = 0;
      let totalTweets = 0;

      console.log(`🚀 Starting mention ingestion for @${userName} since ${sinceTime.toISOString()}`);

      while (hasNextPage && pageCount < maxPages) {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}${cursor ? ` with cursor: ${cursor}` : ''}`);
        
        const mentions = await client.mentions({
          userName,
          sinceTime,
          cursor
        });

        const transformed = TwitterTransformer.transformTwitterResponse(mentions);

        if (transformed.tweets.length > 0) {
          const result = await TwitterDatabaseService.insertTweetsAndIgnoreDuplicates(transformed.tweets);
          console.log(`💾 Uploaded ${result.length} tweets`);
          totalTweets += transformed.tweets.length;
        } else {
          console.log("No tweets found for this page");
          break;
        }
        
        // Update pagination state
        hasNextPage = transformed.hasNextPage;
        cursor = transformed.nextCursor || undefined;
        
        console.log(`✅ Page ${pageCount}: Found ${transformed.tweets.length} tweets, hasNextPage: ${hasNextPage}`);
      }

      const reachedMaxPages = pageCount >= maxPages;
      if (reachedMaxPages) {
        console.log(`⚠️  Reached maximum page limit (${maxPages}). There may be more tweets available.`);
      }
      
      console.log(`🎉 Complete! Processed ${totalTweets} total tweets across ${pageCount} pages`);

      return {
        success: true,
        totalTweets,
        pagesProcessed: pageCount,
        nextCursor: cursor,
        hasMorePages: reachedMaxPages && hasNextPage
      };

    } catch (error) {
      console.error('❌ Ingestion failed:', error);
      return {
        success: false,
        totalTweets: 0,
        pagesProcessed: 0,
        hasMorePages: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              DIRECT EXECUTION                             */
/* -------------------------------------------------------------------------- */

// For local development/testing
async function main() {
  const result = await BrandListenerIngestionService.ingestMentions({
    userName: 'send',
    sinceTime: new Date('2025-08-25'),
    maxPages: 100
  });

  console.log('Final result:', result);
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}