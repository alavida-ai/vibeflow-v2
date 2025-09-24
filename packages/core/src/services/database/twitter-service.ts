import {
    getDb,
    schema
} from "@vibeflow/database";
import { eq, and, isNull, desc, or, inArray, gte } from 'drizzle-orm';
import { createLogger } from "@vibeflow/logging";

const logger = createLogger({
    context: 'cli',
    name: 'twitter-service'
});

export type TweetView = {
    id: number;
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

/**
 * Save parsed tweets with their media to the database
 * Handles duplicates by updating existing records
 * Returns the tweets enriched with their database IDs
 */
export async function insertTweetsWithMedia(parsedTweets: schema.InsertTweetWithMedia[]): Promise<schema.TweetWithMedia[]> {
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
                        updatedAtUtc: new Date(),
                    },
                })
                .returning();

            // Insert media if present
            let savedMedia: schema.TweetMedia[] = [];
            if (media && media.length > 0) {
                savedMedia = await saveMediaForTweet(tweet.id, media);
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
export async function saveMediaForTweet(tweetId: number, mediaItems: Omit<schema.InsertTweetMedia, 'tweetId'>[]): Promise<schema.TweetMedia[]> {
    if (mediaItems.length > 0) {
        const mediaToInsert: schema.InsertTweetMedia[] = mediaItems.map(media => ({
            ...media,
            tweetId
        }));

        await getDb()
            .insert(schema.tweetMedia)
            .values(mediaToInsert)
            .onConflictDoNothing({ target: [schema.tweetMedia.tweetId, schema.tweetMedia.url] }); // unique by tweetId + url
    }

    return await getDb()
        .select()
        .from(schema.tweetMedia)
        .where(eq(schema.tweetMedia.tweetId, tweetId));
}

export async function getMediaByAuthorUsername(authorUsername: string, bestNTweets?: number): Promise<schema.TweetMedia[]> {
    const db = getDb();

    if (bestNTweets) {
        // First, get the best N tweets by EVS
        const bestTweets = await db
            .select({ id: schema.tweets.id })
            .from(schema.tweetAnalytics)
            .innerJoin(schema.tweets, eq(schema.tweetAnalytics.tweetId, schema.tweets.id))
            .where(eq(schema.tweets.authorUsername, authorUsername))
            .orderBy(desc(schema.tweetAnalytics.finalScore))
            .limit(bestNTweets);

        const bestTweetIds = bestTweets.map(tweet => tweet.id);

        if (bestTweetIds.length === 0) return [];

        // Then get media for those specific tweets
        const result = await db
            .select({
                tweetMedia: schema.tweetMedia
            })
            .from(schema.tweetMedia)
            .innerJoin(schema.tweetAnalytics, eq(schema.tweets.id, schema.tweetAnalytics.tweetId))
            .innerJoin(schema.tweets, eq(schema.tweetAnalytics.tweetId, schema.tweets.id))
            .where(and(
                eq(schema.tweets.authorUsername, authorUsername),
                isNull(schema.tweetMedia.description),
                inArray(schema.tweets.id, bestTweetIds)
            ))
            .orderBy(desc(schema.tweetAnalytics.finalScore));
        return result.map(row => row.tweetMedia);
    } else {
        // get all media without filtering
        const result = await db
            .select({
                tweetMedia: schema.tweetMedia
            })
            .from(schema.tweetMedia)
            .innerJoin(schema.tweets, eq(schema.tweetAnalytics.tweetId, schema.tweets.id))
            .innerJoin(schema.tweetAnalytics, eq(schema.tweets.id, schema.tweetAnalytics.tweetId))
            .where(and(eq(schema.tweets.authorUsername, authorUsername), isNull(schema.tweetMedia.description)))
            .orderBy(desc(schema.tweetAnalytics.finalScore));
        return result.map(row => row.tweetMedia);
    }
}

export async function getMediaPendingDescriptionByTweetIds(tweetIds: number[]): Promise<schema.TweetMedia[]> {
    const db = getDb();

    return await db
        .select()
        .from(schema.tweetMedia)
        .where(
            and(
                inArray(schema.tweetMedia.tweetId, tweetIds),
                or(
                    isNull(schema.tweetMedia.description), 
                    eq(schema.tweetMedia.status, schema.tweetMediaStatusConstants.pending),
                    eq(schema.tweetMedia.status, schema.tweetMediaStatusConstants.error)
                )
            )
        );
}

/*
* Update media descriptions for a tweet after AI processing
*/
export async function updateMediaDescriptions(media: schema.TweetMedia): Promise<void> {
    await getDb()
        .update(schema.tweetMedia)
        .set({
            description: media.description,
            updatedAtUtc: media.updatedAtUtc,
            status: media.status
        })
        .where(eq(schema.tweetMedia.id, media.id));
}

export async function getTweetsViewByUsername(authorUsername: string, limit?: number): Promise<TweetView[]> {
    const db = getDb();

    // Get tweets with their media using a left join to include tweets without media
    const baseQuery = db
        .select({
            id: schema.tweets.id,
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
 * Get tweets by their IDs, optionally limited and ordered by final score
 * Used for calculating framework metrics based on specific tweet references
 */
export async function getTweetsByIds(
    tweetIds: number[], 
    options?: { limit?: number }
): Promise<TweetView[]> {
    if (tweetIds.length === 0) return [];

    const db = getDb();

    logger.info({ tweetIds, options }, 'Getting tweets by ids');

    // Build the query with proper typing
    const baseQuery = db
        .select({
            tweet: schema.tweets,
            media: schema.tweetMedia
        })
        .from(schema.tweets)
        .leftJoin(
            schema.tweetMedia,
            eq(schema.tweetMedia.tweetId, schema.tweets.id)
        )
        .leftJoin(
            schema.tweetAnalytics,
            eq(schema.tweetAnalytics.tweetId, schema.tweets.id)
        )
        .where(inArray(schema.tweets.id, tweetIds))
        .orderBy(
            desc(schema.tweetAnalytics.finalScore),  // NULLs will sort last
            desc(schema.tweets.createdAtUtc)
        );

    // Apply limit if specified and execute query
    const tweets = options?.limit 
        ? await baseQuery.limit(options.limit)
        : await baseQuery;

    logger.info({ tweets }, 'Tweets by ids');

    // Group media by tweet ID
    const mediaByTweetId = new Map<number, Array<{
        type: schema.TweetMedia['type'];
        description: string | null;
    }>>();

    tweets.forEach(({ tweet, media }) => {
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

    // Get unique tweets and combine with their media, preserving the order from the query
    const uniqueTweets = new Map<number, typeof schema.tweets.$inferSelect>();
    const tweetOrder: number[] = [];
    
    tweets.forEach(({ tweet }) => {
        if (!uniqueTweets.has(tweet.id)) {
            uniqueTweets.set(tweet.id, tweet);
            tweetOrder.push(tweet.id);
        }
    });

    // Return tweets in the order determined by the query (by final score, then by created date)
    return tweetOrder.map(tweetId => {
        const tweet = uniqueTweets.get(tweetId)!;
        return {
            id: tweet.id,
            text: tweet.text,
            retweetCount: tweet.retweetCount,
            replyCount: tweet.replyCount,
            likeCount: tweet.likeCount,
            quoteCount: tweet.quoteCount,
            viewCount: tweet.viewCount,
            bookmarkCount: tweet.bookmarkCount,
            media: mediaByTweetId.get(tweet.id) || []
        };
    });
}