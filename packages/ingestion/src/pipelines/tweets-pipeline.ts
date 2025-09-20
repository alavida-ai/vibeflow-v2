// packages/ingestion/src/pipeline/TwitterPipeline.ts
import { PipelineConfig, PipelineOptions, PipelineResult } from './types';
import { schema } from '@vibeflow/database';

export class TwitterPipeline {
  constructor(private config: PipelineConfig) {}

  async run(params: any, options?: PipelineOptions): Promise<PipelineResult> {
    let cursor = options?.cursor;
    let hasNextPage = true;
    let pageCount = 0;
    let totalTweets = 0;
    let savedTweets: schema.TweetWithMedia[] = [];
    const maxPages = options?.maxPages || 100;
    const processorResults: Record<string, any> = {};

    console.log(`🚀 Starting Twitter ingestion`);

    try {
      while (hasNextPage && pageCount < maxPages) {
        pageCount++;
        console.log(`📄 Page ${pageCount}${cursor ? ` (cursor: ${cursor})` : ''}`);

        // Fetch tweets
        const response = await this.config.source.fetch(params, cursor);
        
        if (response.tweets.length === 0) {
          console.log("No tweets found");
          break;
        }

        // Transform tweets
        const scrapedTweets: schema.InsertTweetWithMedia[] = response.tweets.map(tweet => 
          this.config.transformer.transform(tweet, {
            source: this.getSourceName()
          })
        );

        // Save tweets
        savedTweets = await this.config.sink.save(scrapedTweets);
        totalTweets += savedTweets.length;
        
        // Update pagination
        hasNextPage = response.hasNextPage;
        cursor = response.nextCursor || undefined;

        console.log(`✅ Page ${pageCount}: ${savedTweets.length} saved tweets`);
      }

      console.log(`🎉 Complete! ${totalTweets} tweets across ${pageCount} pages`);

      return {
        success: true,
        totalTweets,
        savedTweets,
        pagesProcessed: pageCount,
        nextCursor: cursor,
        hasMorePages: pageCount >= maxPages && hasNextPage,
        processorResults
      };

    } catch (error: any) {
      console.error('❌ Pipeline failed:', error);
      return {
        success: false,
        totalTweets,
        savedTweets,
        pagesProcessed: pageCount,
        hasMorePages: false,
        processorResults,
        error: error.message
      };
    }
  }

  private getSourceName(): (typeof schema.sourceConstants)[keyof typeof schema.sourceConstants] {
    const endpointName = this.config.source.constructor.name.replace('Endpoint', '').toLowerCase();
    
    // Map endpoint class names to source constants
    switch (endpointName) {
      case 'usermentions':
        return 'user-mentions';
      case 'userlasttweets':
        return 'user-last-tweets';
      case 'replies':
        return 'tweet-replies';
      default:
        // Default fallback
        return 'user-mentions';
    }
  }
}