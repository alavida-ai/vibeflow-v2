import { TwitterEndpoint } from '../sources/endpoints';
import { Transformer } from '../transformers';
import { Sink } from '../sinks';
import { TweetProcessor, ProcessorResult } from '../processors';
import { schema } from '@vibeflow/database';

export interface PipelineConfig {
    source: TwitterEndpoint;
    transformer: Transformer;
    sink: Sink;
    processors: TweetProcessor[] | undefined;
}

export interface PipelineOptions {
    maxPages?: number;
    cursor?: string;
}

// TODO: return tweet ids
export interface PipelineResult {
    success: boolean;
    totalTweets: number;
    savedTweets: schema.TweetWithMedia[];
    pagesProcessed: number;
    nextCursor?: string;
    hasMorePages: boolean;
    processorResults?: Record<string, ProcessorResult>;
    error?: string;
}