import { schema } from '@vibeflow/database';
import { TwitterService } from '@vibeflow/core';

export class TweetSink {
  async save(tweets: schema.InsertTweetWithMedia[]): Promise<void> {
    await TwitterService.insertTweetsWithMedia(tweets);
  }
}