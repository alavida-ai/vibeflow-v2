import { TwitterEndpoint } from '../source/endpoints';
import { Transformer } from '../transformers';
import { Sink } from '../sink';
import { TweetProcessor, ProcessorResult } from '../processors';

export interface PipelineConfig {
    endpoint: TwitterEndpoint;
    transformer: Transformer;
    sink: Sink;
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