import { schema } from '@vibeflow/database';

export interface TweetProcessor {
    name: string;
    process(tweets: schema.TweetWithMedia[]): Promise<ProcessorResult>;
}

export interface ProcessorResult {
    tweetIds: number[];
    success: boolean;
    processed: number;
    message?: string;
    errors?: string[];
}