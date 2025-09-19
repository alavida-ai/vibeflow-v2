import { TweetData } from '../pipeline/types';
import * as ListenerService from '@vibeflow/core';
import * as AnalyzerService from '@vibeflow/core';
import { getDb, schema } from '@vibeflow/database';

export class TweetStorage {
  async save(tweets: TweetData[], storageType: 'listener' | 'analyzer'): Promise<void> {
    if (storageType === 'analyzer') {
      await this.saveToAnalyzerFlow(tweets);
    } else {
      await this.saveToListenerFlow(tweets);
    }
  }

  private async saveToListenerFlow(tweets: TweetData[]): Promise<void> {
    // Use existing listener service for tweets
    const tweetRecords = tweets.map(({ tweet }) => tweet);
    const result = await ListenerService.insertTweetsAndIgnoreDuplicates(tweetRecords);
    console.log(`💾 Saved ${result.length} tweets to listener flow`);
    
    // Save media to unified table
    let mediaCount = 0;
    for (const tweetData of tweets) {
      if (tweetData.media && tweetData.media.length > 0) {
        await this.saveMediaForTweet(tweetData.tweet.tweetId, tweetData.media);
        mediaCount += tweetData.media.length;
      }
    }
    
    if (mediaCount > 0) {
      console.log(`💾 Saved ${mediaCount} media items`);
    }
  }

  private async saveToAnalyzerFlow(tweets: TweetData[]): Promise<void> {
    // Convert to analyzer format and use existing service
    const analyzerTweets = tweets.map(this.toAnalyzerFormat);
    const result = await AnalyzerService.saveParsedTweets(analyzerTweets);
    console.log(`💾 Saved ${result.length} tweets to analyzer flow`);
  }

  private async saveMediaForTweet(tweetId: string, media: schema.InsertTweetMedia[]): Promise<void> {
    if (media.length === 0) return;
    
    const db = getDb();
    const mediaToInsert = media.map(m => ({ ...m, tweetId }));
    
    await db.insert(schema.tweetMediaTable)
      .values(mediaToInsert)
      .onConflictDoNothing();
  }

  private toAnalyzerFormat(tweetData: TweetData): schema.InsertTweetAnalyzerWithMedia {
    const { tweet, media = [] } = tweetData;
    
    return {
      apiId: tweet.tweetId,
      url: tweet.tweetUrl,
      text: tweet.text,
      retweetCount: tweet.retweetCount,
      replyCount: tweet.replyCount,
      likeCount: tweet.likeCount,
      quoteCount: tweet.quoteCount,
      viewCount: tweet.viewCount,
      bookmarkCount: tweet.bookmarkCount,
      username: tweet.authorUsername || '',
      type: tweet.type || 'text',
      createdAt: tweet.createdAtUtc,
      evs: tweet.evs || 0,
      media: media.map(m => ({
        type: m.type,
        url: m.url,
        description: m.description
      }))
    };
  }
}
