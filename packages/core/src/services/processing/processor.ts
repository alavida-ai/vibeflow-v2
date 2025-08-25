import type { ProcessedTweet, Tweet } from '@brand-listener/types';

export class TweetProcessor {

  async process(
    tweets: Tweet[],
    thresholds = { notify: 0.7, log_only: 0.6 }
  ): Promise<ProcessedTweet[]> {
    const processed: ProcessedTweet[] = [];
    
    // Process mentions - always relevant
    tweets.forEach(tweet => {
      processed.push({
        tweet,
        source: 'mentions',
        shouldNotify: true,
        shouldLog: true,
        relevanceScore: 1.0 // Mentions are always 100% relevant
      });
    });
    
    return processed;
  }
}
