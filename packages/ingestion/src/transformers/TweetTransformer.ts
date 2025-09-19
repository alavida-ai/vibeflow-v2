import { ApiTweet } from '../source/TwitterClient';
import { schema } from '@vibeflow/database';

export interface TransformOptions {
    source: string;
}

export class TweetTransformer {
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

            // Pipeline state
            status: "pending" as const,
            errors: [],

            // Metadata
            source: options.source,
            rawJson: tweet,

            // Unified fields
            type: this.determineTweetType(tweet),
        };

        const media = this.extractMedia(tweet);

        const result: schema.InsertTweetWithMedia = {
            ...tweetData,
            media: media,
        };

        return result;
    }

    // TODO: can this be matched with the schema.tweetMediaTypeEnum?
    private determineTweetType(tweet: ApiTweet): "text" | "image" | "video" | "animated_gif" {
        const media = tweet.extendedEntities?.media;
        if (!media || media.length === 0) return "text";
        return media[0].type as "text" | "image" | "video" | "animated_gif";
    }

    private extractMedia(tweet: ApiTweet): schema.InsertTweetMediaWithoutTweetId[] {
        const mediaArr = tweet.extendedEntities?.media || [];
        if (!Array.isArray(mediaArr)) return [];

        return mediaArr.map((media) => {
            if (media.type === 'video' && media.video_info && Array.isArray(media.video_info.variants)) {
                // Find the highest-bitrate MP4 variant
                const mp4s = media.video_info.variants.filter((v: any) => v.content_type === 'video/mp4');
                let best = mp4s[0];
                for (const variant of mp4s) {
                    if (!best || (variant.bitrate && (!best.bitrate || variant.bitrate > best.bitrate))) {
                        best = variant;
                    }
                }
                return {
                    tweetId: tweet.id,
                    type: 'video' as const,
                    url: best.url,
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            } else {
                return {
                    tweetId: tweet.id,
                    type: media.type as "text" | "image" | "video" | "animated_gif",
                    url: media.media_url_https,
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
        });
    }
}
