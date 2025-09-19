// packages/ingestion/src/pipeline/types.ts
import { ApiTweet } from '../source/TwitterClient';
import { schema } from '@vibeflow/database';

export interface TwitterEndpoint {
  fetch(params: any, cursor?: string): Promise<{
    tweets: ApiTweet[];
    hasNextPage: boolean;
    nextCursor?: string | null;
  }>;
}

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

export interface PipelineConfig {
  endpoint: TwitterEndpoint;
  storage: 'listener' | 'analyzer';  // Which flow to use
  processors: TweetProcessor[];
}

export interface PipelineOptions {
  maxPages?: number;
  cursor?: string;
}

export interface PipelineResult {
  success: boolean;
  totalTweets: number;
  pagesProcessed: number;
  nextCursor?: string;
  hasMorePages: boolean;
  processorResults: Record<string, ProcessorResult>;
  error?: string;
}