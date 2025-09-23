import { schema } from '@vibeflow/database';
import { ApiTweet } from '../sources';

export * from './tweet';

export interface TransformOptions {
    source: (typeof schema.sourceConstants)[keyof typeof schema.sourceConstants];
}

export interface Transformer {
    transform(tweet: ApiTweet, options: TransformOptions): schema.InsertTweetWithMedia;
}