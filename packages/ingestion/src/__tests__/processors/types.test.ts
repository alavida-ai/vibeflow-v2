import { describe, it, expect } from 'vitest';
import { TweetProcessor, ProcessorResult } from '../../processors/types';
import { schema } from '@vibeflow/database';

describe('Processor Types', () => {
    describe('TweetProcessor interface', () => {
        it('should be implementable by a class', () => {
            class TestProcessor implements TweetProcessor {
                name = 'TestProcessor';
                
                async process(tweets: schema.TweetWithMedia[]): Promise<ProcessorResult> {
                    return {
                        tweetIds: tweets.map(t => t.id),
                        success: true,
                        processed: tweets.length,
                        message: `Processed ${tweets.length} tweets`
                    };
                }
            }

            const processor = new TestProcessor();
            expect(processor.name).toBe('TestProcessor');
            expect(typeof processor.process).toBe('function');
        });

        it('should require name property', () => {
            // This test ensures TypeScript compilation would fail without name
            const processor: TweetProcessor = {
                name: 'RequiredName',
                async process(tweets: schema.TweetWithMedia[]): Promise<ProcessorResult> {
                    return {
                        tweetIds: [],
                        success: true,
                        processed: 0
                    };
                }
            };

            expect(processor.name).toBe('RequiredName');
        });

        it('should require process method with correct signature', async () => {
            const mockTweets: schema.TweetWithMedia[] = [
                {
                    id: 1,
                    apiId: 'test1',
                    text: 'Test tweet',
                    url: 'https://twitter.com/test/1',
                    authorId: 'author1',
                    authorUsername: 'testuser',
                    authorName: 'Test User',
                    authorFollowers: 100,
                    conversationId: null,
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 0,
                    replyCount: 0,
                    retweetCount: 0,
                    quoteCount: 0,
                    viewCount: 0,
                    bookmarkCount: 0,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                }
            ];

            const processor: TweetProcessor = {
                name: 'TestProcessor',
                async process(tweets: schema.TweetWithMedia[]): Promise<ProcessorResult> {
                    return {
                        tweetIds: tweets.map(t => t.id),
                        success: true,
                        processed: tweets.length
                    };
                }
            };

            const result = await processor.process(mockTweets);
            expect(result.tweetIds).toEqual([1]);
            expect(result.success).toBe(true);
            expect(result.processed).toBe(1);
        });
    });

    describe('ProcessorResult interface', () => {
        it('should require all mandatory fields', () => {
            const result: ProcessorResult = {
                tweetIds: [1, 2, 3],
                success: true,
                processed: 3
            };

            expect(result.tweetIds).toEqual([1, 2, 3]);
            expect(result.success).toBe(true);
            expect(result.processed).toBe(3);
        });

        it('should allow optional message field', () => {
            const result: ProcessorResult = {
                tweetIds: [1],
                success: true,
                processed: 1,
                message: 'Processing completed successfully'
            };

            expect(result.message).toBe('Processing completed successfully');
        });

        it('should allow optional errors field', () => {
            const result: ProcessorResult = {
                tweetIds: [1, 2],
                success: false,
                processed: 1,
                errors: ['Failed to process tweet 2', 'Network timeout']
            };

            expect(result.errors).toEqual(['Failed to process tweet 2', 'Network timeout']);
        });

        it('should allow both optional fields together', () => {
            const result: ProcessorResult = {
                tweetIds: [1, 2, 3],
                success: false,
                processed: 2,
                message: 'Partial processing completed',
                errors: ['Tweet 3 failed validation']
            };

            expect(result.message).toBe('Partial processing completed');
            expect(result.errors).toEqual(['Tweet 3 failed validation']);
        });

        it('should handle empty tweetIds array', () => {
            const result: ProcessorResult = {
                tweetIds: [],
                success: true,
                processed: 0,
                message: 'No tweets to process'
            };

            expect(result.tweetIds).toEqual([]);
            expect(result.processed).toBe(0);
        });

        it('should handle failure scenarios correctly', () => {
            const result: ProcessorResult = {
                tweetIds: [1, 2, 3],
                success: false,
                processed: 0,
                errors: ['Database connection failed', 'Processing aborted'],
                message: 'Processing failed completely'
            };

            expect(result.success).toBe(false);
            expect(result.processed).toBe(0);
            expect(result.errors).toHaveLength(2);
        });
    });
});
