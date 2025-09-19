import { TweetProcessor, ProcessorResult, TweetData } from '../pipeline/types';
import { generateVisualDescription, AnalyzerService } from '@vibeflow/core';
import { getDb, schema } from '@vibeflow/database';

export class MediaProcessor implements TweetProcessor {
    name = 'MediaProcessor';

    async process(tweets: TweetData[]): Promise<ProcessorResult> {
        const tweetsWithMedia = tweets.filter(t => t.media && t.media.length > 0);

        if (tweetsWithMedia.length === 0) {
            return {
                success: true,
                processed: 0,
                message: 'No media to process'
            };
        }

        let processed = 0;
        const errors: string[] = [];

        for (const tweetData of tweetsWithMedia) {
            try {
                for (const media of tweetData.media!) {
                    if (!media.description) {
                        const description = await generateVisualDescription(media.type, media.url);
                        media.description = description;
                        media.updatedAt = new Date();
                        await AnalyzerService.updateMediaDescriptions(media);
                        processed++;
                    }
                }
            } catch (error: any) {
                errors.push(`Failed to process media for tweet ${tweetData.tweet.tweetId}: ${error.message}`);
            }
        }

        return {
            success: errors.length === 0,
            processed,
            errors: errors.length > 0 ? errors : undefined,
            message: `Processed ${processed} media items`
        };
    }
}
