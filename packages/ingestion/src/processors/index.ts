import { schema } from '@vibeflow/database';
export * from './MediaProcessor';

export interface TweetProcessor {
    name: string;
    process(tweets: schema.InsertTweetWithMedia[]): Promise<ProcessorResult>;
}

export interface ProcessorResult {
    success: boolean;
    processed: number;
    message?: string;
    errors?: string[];
}