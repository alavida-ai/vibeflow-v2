import { TweetProcessor, ProcessorResult } from '.';
import { calculateBatchTweetAnalytics, batchAddAnalyticsToTweets } from '@vibeflow/core';
import { schema } from '@vibeflow/database';

export class AnalyticsProcessor implements TweetProcessor {
    name = 'AnalyticsProcessor';

    async process(tweets: schema.TweetWithMedia[]): Promise<ProcessorResult> {
        if (tweets.length === 0) {
            return {
                tweetIds: tweets.map(t => t.id),
                success: true,
                processed: 0,
                message: 'No tweets to process analytics for'
            };
        }

        const tweetIds = tweets.map(t => t.id);
        const errors: string[] = [];

        try {
            const tweetsWithAnalytics = await calculateBatchTweetAnalytics(tweets);
            await batchAddAnalyticsToTweets(tweetsWithAnalytics);
            const processed = tweets.length;

            return {
                tweetIds,
                success: true,
                processed,
                message: `Successfully processed analytics for ${processed} tweets`
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            errors.push(`Analytics processing failed: ${errorMessage}`);

            return {
                tweetIds,
                success: false,
                processed: 0,
                errors,
                message: `Failed to process analytics for ${tweets.length} tweets`
            };
        }
    }
}
