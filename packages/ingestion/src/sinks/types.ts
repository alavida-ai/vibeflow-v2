import { schema } from '@vibeflow/database';
export * from './tweet-sink';

export interface Sink {
  save(tweets: schema.InsertTweetWithMedia[]): Promise<schema.TweetWithMedia[]>;
}