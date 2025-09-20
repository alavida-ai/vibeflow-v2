import { schema } from '@vibeflow/database';
export * from './TweetSink';

export interface Sink {
    save(tweets: schema.InsertTweetWithMedia[]): Promise<void>;
  }