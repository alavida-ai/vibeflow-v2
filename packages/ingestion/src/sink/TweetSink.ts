import { schema } from '@vibeflow/database';
import { TwitterService } from '@vibeflow/core';
import { Sink } from '.';

export class TweetSink implements Sink {
  async save(tweets: schema.InsertTweetWithMedia[]): Promise<void> {
    await TwitterService.insertTweetsWithMedia(tweets);
  }
}