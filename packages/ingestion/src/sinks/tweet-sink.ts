import { schema } from '@vibeflow/database';
import { insertTweetsWithMedia } from '@vibeflow/core';
import { Sink } from '.';

export class TweetSink implements Sink {
  async save(tweets: schema.InsertTweetWithMedia[]): Promise<schema.TweetWithMedia[]> {
    return await insertTweetsWithMedia(tweets);
  }
}