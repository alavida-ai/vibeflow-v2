import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsProcessor } from '../../processors/analytics';
import { schema } from '@vibeflow/database';
import * as core from '@vibeflow/core';

// Mock the core functions
vi.mock('@vibeflow/core', () => ({
    calculateBatchTweetAnalytics: vi.fn(),
    batchAddAnalyticsToTweets: vi.fn(),
}));

describe('AnalyticsProcessor', () => {
    let processor: AnalyticsProcessor;
    let mockCalculateBatchTweetAnalytics: any;
    let mockBatchAddAnalyticsToTweets: any;

    beforeEach(() => {
        processor = new AnalyticsProcessor();
        mockCalculateBatchTweetAnalytics = vi.mocked(core.calculateBatchTweetAnalytics);
        mockBatchAddAnalyticsToTweets = vi.mocked(core.batchAddAnalyticsToTweets);
        
        // Reset mocks
        mockCalculateBatchTweetAnalytics.mockReset();
        mockBatchAddAnalyticsToTweets.mockReset();
    });

    describe('processor properties', () => {
        it('should have correct name', () => {
            expect(processor.name).toBe('AnalyticsProcessor');
        });
    });

    describe('process method', () => {
        it('should handle empty tweets array', async () => {
            const result = await processor.process([]);

            expect(result).toEqual({
                tweetIds: [],
                success: true,
                processed: 0,
                message: 'No tweets to process analytics for'
            });

            expect(mockCalculateBatchTweetAnalytics).not.toHaveBeenCalled();
            expect(mockBatchAddAnalyticsToTweets).not.toHaveBeenCalled();
        });

        it('should successfully process tweets with analytics', async () => {
            const mockTweets: schema.TweetWithMedia[] = [
                {
                    id: 1,
                    apiId: 'tweet1',
                    text: 'Test tweet 1',
                    url: 'https://twitter.com/test/1',
                    authorId: 'author1',
                    authorUsername: 'testuser',
                    authorName: 'Test User',
                    authorFollowers: 1000,
                    conversationId: 'conv1',
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 10,
                    replyCount: 5,
                    retweetCount: 3,
                    quoteCount: 1,
                    viewCount: 100,
                    bookmarkCount: 2,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                },
                {
                    id: 2,
                    apiId: 'tweet2',
                    text: 'Test tweet 2',
                    url: 'https://twitter.com/test/2',
                    authorId: 'author2',
                    authorUsername: 'testuser2',
                    authorName: 'Test User 2',
                    authorFollowers: 2000,
                    conversationId: 'conv2',
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 20,
                    replyCount: 10,
                    retweetCount: 6,
                    quoteCount: 2,
                    viewCount: 200,
                    bookmarkCount: 4,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                }
            ];

            const mockAnalytics: schema.InsertTweetAnalytics[] = [
                {
                    tweetId: 1,
                    rawEngagementScore: '15.5',
                    normalizedEngagementScore: '0.8',
                    freshnessAdjustedScore: '0.75',
                    finalScore: '0.7',
                    authorSizeNormalizationFactor: '0.9',
                    freshnessDecayFactor: '0.95',
                    ageInHours: '2.5',
                    shouldReply: true,
                    algorithmVersion: '1.0'
                },
                {
                    tweetId: 2,
                    rawEngagementScore: '25.0',
                    normalizedEngagementScore: '0.9',
                    freshnessAdjustedScore: '0.85',
                    finalScore: '0.8',
                    authorSizeNormalizationFactor: '0.95',
                    freshnessDecayFactor: '0.9',
                    ageInHours: '1.5',
                    shouldReply: true,
                    algorithmVersion: '1.0'
                }
            ];

            mockCalculateBatchTweetAnalytics.mockResolvedValue(mockAnalytics);
            mockBatchAddAnalyticsToTweets.mockResolvedValue(undefined);

            const result = await processor.process(mockTweets);

            expect(result).toEqual({
                tweetIds: [1, 2],
                success: true,
                processed: 2,
                message: 'Successfully processed analytics for 2 tweets'
            });

            expect(mockCalculateBatchTweetAnalytics).toHaveBeenCalledWith(mockTweets);
            expect(mockBatchAddAnalyticsToTweets).toHaveBeenCalledWith(mockAnalytics);
        });

        it('should handle calculation error gracefully', async () => {
            const mockTweets: schema.TweetWithMedia[] = [
                {
                    id: 1,
                    apiId: 'tweet1',
                    text: 'Test tweet 1',
                    url: 'https://twitter.com/test/1',
                    authorId: 'author1',
                    authorUsername: 'testuser',
                    authorName: 'Test User',
                    authorFollowers: 1000,
                    conversationId: 'conv1',
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 10,
                    replyCount: 5,
                    retweetCount: 3,
                    quoteCount: 1,
                    viewCount: 100,
                    bookmarkCount: 2,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                }
            ];

            const calculationError = new Error('Analytics calculation failed');
            mockCalculateBatchTweetAnalytics.mockRejectedValue(calculationError);

            const result = await processor.process(mockTweets);

            expect(result).toEqual({
                tweetIds: [1],
                success: false,
                processed: 0,
                errors: ['Analytics processing failed: Analytics calculation failed'],
                message: 'Failed to process analytics for 1 tweets'
            });

            expect(mockCalculateBatchTweetAnalytics).toHaveBeenCalledWith(mockTweets);
            expect(mockBatchAddAnalyticsToTweets).not.toHaveBeenCalled();
        });

        it('should handle database save error gracefully', async () => {
            const mockTweets: schema.TweetWithMedia[] = [
                {
                    id: 1,
                    apiId: 'tweet1',
                    text: 'Test tweet 1',
                    url: 'https://twitter.com/test/1',
                    authorId: 'author1',
                    authorUsername: 'testuser',
                    authorName: 'Test User',
                    authorFollowers: 1000,
                    conversationId: 'conv1',
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 10,
                    replyCount: 5,
                    retweetCount: 3,
                    quoteCount: 1,
                    viewCount: 100,
                    bookmarkCount: 2,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                }
            ];

            const mockAnalytics: schema.InsertTweetAnalytics[] = [
                {
                    tweetId: 1,
                    rawEngagementScore: '15.5',
                    normalizedEngagementScore: '0.8',
                    freshnessAdjustedScore: '0.75',
                    finalScore: '0.7',
                    authorSizeNormalizationFactor: '0.9',
                    freshnessDecayFactor: '0.95',
                    ageInHours: '2.5',
                    shouldReply: true,
                    algorithmVersion: '1.0'
                }
            ];

            const saveError = new Error('Database save failed');
            mockCalculateBatchTweetAnalytics.mockResolvedValue(mockAnalytics);
            mockBatchAddAnalyticsToTweets.mockRejectedValue(saveError);

            const result = await processor.process(mockTweets);

            expect(result).toEqual({
                tweetIds: [1],
                success: false,
                processed: 0,
                errors: ['Analytics processing failed: Database save failed'],
                message: 'Failed to process analytics for 1 tweets'
            });

            expect(mockCalculateBatchTweetAnalytics).toHaveBeenCalledWith(mockTweets);
            expect(mockBatchAddAnalyticsToTweets).toHaveBeenCalledWith(mockAnalytics);
        });

        it('should handle non-Error exceptions', async () => {
            const mockTweets: schema.TweetWithMedia[] = [
                {
                    id: 1,
                    apiId: 'tweet1',
                    text: 'Test tweet 1',
                    url: 'https://twitter.com/test/1',
                    authorId: 'author1',
                    authorUsername: 'testuser',
                    authorName: 'Test User',
                    authorFollowers: 1000,
                    conversationId: 'conv1',
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 10,
                    replyCount: 5,
                    retweetCount: 3,
                    quoteCount: 1,
                    viewCount: 100,
                    bookmarkCount: 2,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                }
            ];

            // Throw a non-Error object
            mockCalculateBatchTweetAnalytics.mockRejectedValue('String error');

            const result = await processor.process(mockTweets);

            expect(result).toEqual({
                tweetIds: [1],
                success: false,
                processed: 0,
                errors: ['Analytics processing failed: Unknown error occurred'],
                message: 'Failed to process analytics for 1 tweets'
            });
        });

        it('should process single tweet correctly', async () => {
            const mockTweets: schema.TweetWithMedia[] = [
                {
                    id: 42,
                    apiId: 'tweet42',
                    text: 'Single test tweet',
                    url: 'https://twitter.com/test/42',
                    authorId: 'author42',
                    authorUsername: 'singleuser',
                    authorName: 'Single User',
                    authorFollowers: 500,
                    conversationId: 'conv42',
                    isReply: false,
                    inReplyToId: null,
                    inReplyToUsername: null,
                    likeCount: 5,
                    replyCount: 2,
                    retweetCount: 1,
                    quoteCount: 0,
                    viewCount: 50,
                    bookmarkCount: 1,
                    createdAtUtc: new Date(),
                    capturedAtUtc: new Date(),
                    updatedAtUtc: new Date(),
                    source: 'user-mentions' as any,
                    rawJson: {},
                    language: 'en',
                    media: []
                }
            ];

            const mockAnalytics: schema.InsertTweetAnalytics[] = [
                {
                    tweetId: 42,
                    rawEngagementScore: '8.0',
                    normalizedEngagementScore: '0.6',
                    freshnessAdjustedScore: '0.55',
                    finalScore: '0.5',
                    authorSizeNormalizationFactor: '0.7',
                    freshnessDecayFactor: '0.8',
                    ageInHours: '3.0',
                    shouldReply: false,
                    algorithmVersion: '1.0'
                }
            ];

            mockCalculateBatchTweetAnalytics.mockResolvedValue(mockAnalytics);
            mockBatchAddAnalyticsToTweets.mockResolvedValue(undefined);

            const result = await processor.process(mockTweets);

            expect(result).toEqual({
                tweetIds: [42],
                success: true,
                processed: 1,
                message: 'Successfully processed analytics for 1 tweets'
            });
        });
    });
});