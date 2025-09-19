import {
    getDb,
    schema
} from "@vibeflow/database";
import { eq, and, isNull, desc, inArray } from 'drizzle-orm';

// Type for the getBestPerformingTweetsByUsernameView return value
export type TweetAnalysisView = {
    id: number;
    type: schema.Tweet['type'];
    text: string;
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    viewCount: number;
    bookmarkCount: number;
    media: Array<{
        type: schema.TweetMedia['type'];
        description: string | null;
    }>;
};

export class TwitterService {
    /**
     * Save parsed tweets with their media to the database
     * Handles duplicates by updating existing records
     * Returns the tweets enriched with their database IDs
     */

    static async insertTweetsWithMedia(parsedTweets: schema.InsertTweetWithMedia[]): Promise<schema.TweetWithMedia[]> {
        if (parsedTweets.length === 0) return [];

        const savedTweets: schema.TweetWithMedia[] = [];

        try {
            for (const parsedTweet of parsedTweets) {
                // Convert ParsedTweet to NewTweet
                const { media, ...tweetData } = parsedTweet;

                // Insert/update tweet and get the ID
                const [tweet] = await getDb()
                    .insert(schema.tweets)
                    .values(tweetData as schema.InsertTweet)
                    .onConflictDoUpdate({
                        target: schema.tweets.apiId,
                        set: {
                            retweetCount: parsedTweet.retweetCount,
                            replyCount: parsedTweet.replyCount,
                            likeCount: parsedTweet.likeCount,
                            quoteCount: parsedTweet.quoteCount,
                            viewCount: parsedTweet.viewCount,
                            bookmarkCount: parsedTweet.bookmarkCount,
                            // evs: parsedTweet.evs, TODO: add EVS from analytics table
                            updatedAtUtc: new Date(),
                        },
                    })
                    .returning();

                // Insert media if present
                let savedMedia: schema.TweetMedia[] = [];
                if (media && media.length > 0) {
                    savedMedia = await this.saveMediaForTweet(tweet.id, media);
                }

                const savedTweet: schema.TweetWithMedia = {
                    ...tweet,
                    media: savedMedia
                };

                // Add the enriched tweet to our result array
                savedTweets.push(savedTweet);
            }

            return savedTweets;
        } catch (error) {
            console.error('Error saving tweets to database:', error);
            throw error;
        }
    }

    /**
     * Save media for a specific tweet
     */
    static async saveMediaForTweet(tweetId: number, mediaItems: Omit<schema.InsertTweetMedia, 'tweetId'>[]): Promise<schema.TweetMedia[]> {
        if (mediaItems.length > 0) {
            const mediaToInsert: schema.InsertTweetMedia[] = mediaItems.map(media => ({
                ...media,
                tweetId
            }));

            await getDb()
                .insert(schema.tweetMedia)
                .values(mediaToInsert)
                .onConflictDoNothing({ target: schema.tweetMedia.tweetId }); // don't overwrite existing tweet's media
        }

        return await getDb()
            .select()
            .from(schema.tweetMedia)
            .where(eq(schema.tweetMedia.tweetId, tweetId));
    }

    static async getMediaByAuthorUsername(authorUsername: string, bestNTweets?: number): Promise<schema.TweetMedia[]> {
        const db = getDb();

        if (bestNTweets) {
            // First, get the best N tweets by EVS
            const bestTweets = await db
                .select({ id: schema.tweets.id })
                .from(schema.tweets)
                .where(eq(schema.tweets.authorUsername, authorUsername))
                // .orderBy(desc(schema.tweets.evs)) TODO: add EVS from analytics table
                .limit(bestNTweets);

            const bestTweetIds = bestTweets.map(tweet => tweet.id);

            if (bestTweetIds.length === 0) return [];

            // Then get media for those specific tweets
            return await db
                .select({
                    id: schema.tweetMedia.id,
                    tweetId: schema.tweetMedia.tweetId,
                    url: schema.tweetMedia.url,
                    type: schema.tweetMedia.type,
                    description: schema.tweetMedia.description,
                    capturedAtUtc: schema.tweetMedia.capturedAtUtc,
                    updatedAtUtc: schema.tweetMedia.updatedAtUtc
                })
                .from(schema.tweetMedia)
                .innerJoin(schema.tweets, eq(schema.tweetMedia.tweetId, schema.tweets.id))
                .where(and(
                    eq(schema.tweets.authorUsername, authorUsername),
                    isNull(schema.tweetMedia.description),
                    inArray(schema.tweets.id, bestTweetIds)
                ))
                // .orderBy(desc(schema.tweets.evs)); TODO: add EVS from analytics table
        } else {
            // get all media without filtering
            return await db
                .select({
                    id: schema.tweetMedia.id,
                    tweetId: schema.tweetMedia.tweetId,
                    url: schema.tweetMedia.url,
                    type: schema.tweetMedia.type,
                    description: schema.tweetMedia.description,
                    capturedAtUtc: schema.tweetMedia.capturedAtUtc,
                    updatedAtUtc: schema.tweetMedia.updatedAtUtc
                })
                .from(schema.tweetMedia)
                .innerJoin(schema.tweets, eq(schema.tweetMedia.tweetId, schema.tweets.id))
                .where(and(eq(schema.tweets.authorUsername, authorUsername), isNull(schema.tweetMedia.description)))
                // .orderBy(desc(schema.tweets.evs)); TODO: add EVS from analytics table
        }
    }

    /*
    * Update media descriptions for a tweet after AI processing
    */
    static async updateMediaDescriptions(media: schema.TweetMedia): Promise<void> {
        await getDb()
            .update(schema.tweetMedia)
            .set({
                description: media.description,
                updatedAtUtc: media.updatedAtUtc
            })
            .where(eq(schema.tweetMedia.id, media.id));

        // Update tweet status to indicate visual processing is complete
        const tweetId = media.tweetId;
        await getDb()
            .update(schema.tweets)
            .set({
                status: 'visual_processed',
                updatedAtUtc: new Date()
            })
            .where(eq(schema.tweets.id, tweetId));
    }

    static async getTweetsAnalysisViewByUsername(authorUsername: string, limit?: number): Promise<TweetAnalysisView[]> {
        const db = getDb();

        // Get tweets with their media using a left join to include tweets without media
        const baseQuery = db
            .select({
                id: schema.tweets.id,
                tweetType: schema.tweets.type,
                text: schema.tweets.text,
                retweetCount: schema.tweets.retweetCount,
                replyCount: schema.tweets.replyCount,
                likeCount: schema.tweets.likeCount,
                quoteCount: schema.tweets.quoteCount,
                viewCount: schema.tweets.viewCount,
                bookmarkCount: schema.tweets.bookmarkCount,
            })
            .from(schema.tweets)
            .where(eq(schema.tweets.authorUsername, authorUsername))
            // .orderBy(desc(schema.tweets.evs)); TODO: add EVS from analytics table

        const bestTweets = await (limit ? baseQuery.limit(limit) : baseQuery);

        // get media for each tweet
        const media = await db
            .select({
                tweetId: schema.tweetMedia.tweetId,
                type: schema.tweetMedia.type,
                description: schema.tweetMedia.description,
            })
            .from(schema.tweetMedia)
            .where(inArray(schema.tweetMedia.tweetId, bestTweets.map(tweet => tweet.id)));

        return bestTweets.map(tweet => ({
            id: tweet.id,
            type: tweet.tweetType,
            text: tweet.text,
            retweetCount: tweet.retweetCount,
            replyCount: tweet.replyCount,
            likeCount: tweet.likeCount,
            quoteCount: tweet.quoteCount,
            viewCount: tweet.viewCount,
            bookmarkCount: tweet.bookmarkCount,
            media: media
                .filter(m => m.tweetId === tweet.id)
                .map(m => ({
                    type: m.type,
                    description: m.description
                }))
        }));
    }

    /**
     * Get tweets by their IDs
     * Used for calculating framework metrics based on specific tweet references
     */
    static async getTweetsByIds(tweetIds: number[]): Promise<TweetAnalysisView[]> {
        if (tweetIds.length === 0) return [];

        const db = getDb();

        // Get tweets and their media in a single query
        const tweetsWithMedia = await db
            .select({
                tweet: schema.tweets,
                media: schema.tweetMedia
            })
            .from(schema.tweets)
            .leftJoin(
                schema.tweetMedia,
                eq(schema.tweetMedia.tweetId, schema.tweets.id)
            )
            .where(inArray(schema.tweets.id, tweetIds))
            .orderBy(desc(schema.tweets.createdAtUtc));

        // Group media by tweet ID
        const mediaByTweetId = new Map<number, Array<{
            type: schema.TweetMedia['type'];
            description: string | null;
        }>>();

        tweetsWithMedia.forEach(({ tweet, media }) => {
            if (media) {
                if (!mediaByTweetId.has(tweet.id)) {
                    mediaByTweetId.set(tweet.id, []);
                }
                mediaByTweetId.get(tweet.id)!.push({
                    type: media.type,
                    description: media.description
                });
            }
        });

        // Get unique tweets and combine with their media
        const uniqueTweets = new Map<number, typeof schema.tweets.$inferSelect>();
        tweetsWithMedia.forEach(({ tweet }) => {
            uniqueTweets.set(tweet.id, tweet);
        });

        return Array.from(uniqueTweets.values()).map(tweet => ({
            id: tweet.id,
            type: tweet.type,
            text: tweet.text,
            retweetCount: tweet.retweetCount,
            replyCount: tweet.replyCount,
            likeCount: tweet.likeCount,
            quoteCount: tweet.quoteCount,
            viewCount: tweet.viewCount,
            bookmarkCount: tweet.bookmarkCount,
            media: mediaByTweetId.get(tweet.id) || []
        }));
    }
}
