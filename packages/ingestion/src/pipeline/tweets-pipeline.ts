// packages/ingestion/src/pipeline/TwitterPipeline.ts
import { PipelineConfig, PipelineOptions, PipelineResult } from './types';
import { schema } from '@vibeflow/database';
import { TweetTransformer } from '../transformers/TweetTransformer';
import { TweetStorage } from '../sink/TweetStorage';

export class TwitterPipeline {
  private transformer = new TweetTransformer();
  private storage = new TweetStorage();

  constructor(private config: PipelineConfig) {}

  async run(params: any, options?: PipelineOptions): Promise<PipelineResult> {
    let cursor = options?.cursor;
    let hasNextPage = true;
    let pageCount = 0;
    let totalTweets = 0;
    const maxPages = options?.maxPages || 100;
    const processorResults: Record<string, any> = {};

    console.log(`🚀 Starting Twitter ingestion`);

    try {
      while (hasNextPage && pageCount < maxPages) {
        pageCount++;
        console.log(`📄 Page ${pageCount}${cursor ? ` (cursor: ${cursor})` : ''}`);

        // Fetch tweets
        const response = await this.config.endpoint.fetch(params, cursor);
        
        if (response.tweets.length === 0) {
          console.log("No tweets found");
          break;
        }

        // Transform tweets
        const tweetData: schema.InsertTweetWithMedia[] = response.tweets.map(tweet => 
          this.transformer.transform(tweet, {
            source: this.getSourceName(),
            extractMedia: this.shouldExtractMedia(),
            calculateEvs: this.shouldCalculateEvs()
          })
        );

        // Save tweets
        await this.storage.save(tweetData, this.config.storage);
        totalTweets += tweetData.length;

        // Run processors
        for (const processor of this.config.processors) {
          try {
            const result = await processor.process(tweetData);
            processorResults[processor.name] = result;
            console.log(`✅ ${processor.name}: ${result.message}`);
          } catch (error: any) {
            console.error(`❌ ${processor.name} failed:`, error);
            processorResults[processor.name] = {
              success: false,
              processed: 0,
              errors: [error.message]
            };
          }
        }

        // Update pagination
        hasNextPage = response.hasNextPage;
        cursor = response.nextCursor || undefined;

        console.log(`✅ Page ${pageCount}: ${tweetData.length} tweets`);
      }

      console.log(`🎉 Complete! ${totalTweets} tweets across ${pageCount} pages`);

      return {
        success: true,
        totalTweets,
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
        pagesProcessed: pageCount,
        hasMorePages: false,
        processorResults,
        error: error.message
      };
    }
  }

  private getSourceName(): string {
    return this.config.endpoint.constructor.name.replace('Endpoint', '').toLowerCase();
  }

  private shouldExtractMedia(): boolean {
    return this.config.processors.some(p => p.name === 'MediaProcessor');
  }

  private shouldCalculateEvs(): boolean {
    return this.config.storage === 'analyzer' || 
           this.config.processors.some(p => p.name === 'EvsProcessor');
  }
}