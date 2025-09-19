import { TweetProcessor, ProcessorResult } from '../pipeline/types';
import { generateVisualDescription, TwitterService } from '@vibeflow/core';
import { schema } from '@vibeflow/database';

export class MediaProcessor implements TweetProcessor {
    name = 'MediaProcessor';

    async process(tweets: schema.TweetWithMedia[]): Promise<ProcessorResult> {
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

        for (const tweet of tweetsWithMedia) {
            try {
                for (const media of tweet.media!) {
                    if (!media.description) {
                        const description = await generateVisualDescription(media.type, media.url);
                        media.description = description;
                        media.updatedAtUtc = new Date();
                        await TwitterService.updateMediaDescriptions(media);
                        processed++;
                    }
                }
            } catch (error: any) {
                errors.push(`Failed to process media for tweet ${tweet.id}: ${error.message}`);
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
