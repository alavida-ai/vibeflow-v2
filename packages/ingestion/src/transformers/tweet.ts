import { ApiTweet } from '../sources';
import { schema } from '@vibeflow/database';
import { Transformer, TransformOptions } from '.';
import { z } from 'zod';

export class TweetTransformer implements Transformer {
    transform(tweet: ApiTweet, options: TransformOptions): schema.InsertTweetWithMedia {
        const capturedAt = new Date();

        // Base tweet data (compatible with unified schema)
        const tweetData: schema.InsertTweet = {
            apiId: tweet.id,
            text: tweet.text,
            language: tweet.lang || null,
            url: tweet.twitterUrl,

            // Author information
            authorId: tweet.author.id,
            authorUsername: tweet.author.userName || null,
            authorName: tweet.author.name || null,
            authorFollowers: tweet.author.followers || 0,

            // Threading/context
            conversationId: tweet.conversationId || null,
            isReply: tweet.isReply,
            inReplyToId: tweet.inReplyToId || null,
            inReplyToUsername: tweet.inReplyToUsername || null,

            // Engagement metrics
            likeCount: tweet.likeCount,
            replyCount: tweet.replyCount,
            retweetCount: tweet.retweetCount,
            quoteCount: tweet.quoteCount,
            viewCount: tweet.viewCount,
            bookmarkCount: tweet.bookmarkCount || 0,

            // Timestamps
            createdAtUtc: new Date(tweet.createdAt),
            capturedAtUtc: capturedAt,
            updatedAtUtc: capturedAt,

            // Metadata
            source: options.source,
            rawJson: tweet,
        };

        const media = this.extractMedia(tweet);

        const result: schema.InsertTweetWithMedia = {
            ...tweetData,
            media: media,
        };

        return result;
    }

    private mapApiMediaTypeToDbType(apiType: string): z.infer<typeof schema.tweetMediaTypeEnumSchema> {
        switch (apiType) {
            case "photo":
                return schema.tweetMediaTypeConstants.photo;
            case "video":
                return schema.tweetMediaTypeConstants.video;
            case "animated_gif":
                return schema.tweetMediaTypeConstants.animated_gif;
            default:
                throw new Error(`Unknown media type: ${apiType}`);
        }
    }

    private extractMedia(tweet: ApiTweet): schema.InsertTweetMediaWithoutTweetId[] {
        const mediaArr = tweet.extendedEntities?.media || [];
        if (!Array.isArray(mediaArr)) return [];

        return mediaArr.map((media) => {
            if (media.type === 'video' && media.video_info && Array.isArray(media.video_info.variants)) {
                // Find the highest-bitrate MP4 variant (filter out variants without bitrate)
                const mp4s = media.video_info.variants
                    .filter((v: any) => v.content_type === 'video/mp4' && v.bitrate)
                    .sort((a: any, b: any) => b.bitrate - a.bitrate);
                
                const best = mp4s[0] || media.video_info.variants[0]; // fallback to first variant if no MP4 with bitrate
                return {
                    tweetId: tweet.id,
                    type: schema.tweetMediaTypeConstants.video,
                    url: best.url,
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            } else {
                return {
                    tweetId: tweet.id,
                    type: this.mapApiMediaTypeToDbType(media.type),
                    url: media.media_url_https,
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
        });
    }
}
