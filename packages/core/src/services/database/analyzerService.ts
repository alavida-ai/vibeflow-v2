import {
    getDb,
    schema
} from "@brand-listener/database";
import { eq, and, isNull, desc, inArray } from 'drizzle-orm';

// Type for the getBestPerformingTweetsByUsernameView return value
export type TweetAnalysisView = {
    type: schema.TweetAnalyzer['type'];
    text: string;
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    viewCount: number;
    bookmarkCount: number;
    media: Array<{
        type: schema.TweetMediaAnalyzer['type'];
        description: string | null;
    }>;
};

export class AnalyzerService {
    /**
     * Save parsed tweets with their media to the database
     * Handles duplicates by updating existing records
     * Returns the tweets enriched with their database IDs
     */

    static async saveParsedTweets(parsedTweets: schema.InsertTweetAnalyzerWithMedia[]): Promise<schema.SavedTweetAnalyzer[]> {
        if (parsedTweets.length === 0) return [];

        const savedTweets: schema.SavedTweetAnalyzer[] = [];

        try {
            for (const parsedTweet of parsedTweets) {
                // Convert ParsedTweet to NewTweet
                const { media, ...tweetData } = parsedTweet;

                // Insert/update tweet and get the ID
                const [tweet] = await getDb()
                    .insert(schema.tweetsAnalyzer)
                    .values(tweetData as schema.InsertTweetAnalyzer)
                    .onConflictDoUpdate({
                        target: schema.tweetsAnalyzer.apiId,
                        set: {
                            retweetCount: parsedTweet.retweetCount,
                            replyCount: parsedTweet.replyCount,
                            likeCount: parsedTweet.likeCount,
                            quoteCount: parsedTweet.quoteCount,
                            viewCount: parsedTweet.viewCount,
                            bookmarkCount: parsedTweet.bookmarkCount,
                            evs: parsedTweet.evs,
                            status: 'scraped',
                            updatedAt: new Date(),
                        },
                    })
                    .returning();

                // Insert media if present
                let savedMedia: schema.TweetMediaAnalyzer[] = [];
                if (media && media.length > 0) {
                    savedMedia = await this.saveMediaForTweet(tweet.id, media);
                }

                const savedTweet: schema.SavedTweetAnalyzer = {
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
    static async saveMediaForTweet(tweetId: number, mediaItems: Omit<schema.InsertTweetMediaAnalyzer, 'tweetId'>[]): Promise<schema.TweetMediaAnalyzer[]> {
        // Delete existing media for this tweet first
        await getDb().delete(schema.tweetMediaAnalyzer).where(eq(schema.tweetMediaAnalyzer.tweetId, tweetId));

        // Insert new media
        const mediaToInsert: schema.InsertTweetMediaAnalyzer[] = mediaItems.map(media => ({
            ...media,
            tweetId
        }));

        if (mediaToInsert.length > 0) {
            const result = await getDb()
                .insert(schema.tweetMediaAnalyzer)
                .values(mediaToInsert)
                .returning();
            return result;
        }
        return [];
    }

    static async getMediaByAuthorUsername(username: string): Promise<schema.TweetMediaAnalyzer[]> {
        return await getDb()
            .select({
                id: schema.tweetMediaAnalyzer.id,
                tweetId: schema.tweetMediaAnalyzer.tweetId,
                url: schema.tweetMediaAnalyzer.url,
                type: schema.tweetMediaAnalyzer.type,
                description: schema.tweetMediaAnalyzer.description,
                scrapedAt: schema.tweetMediaAnalyzer.scrapedAt,
                updatedAt: schema.tweetMediaAnalyzer.updatedAt
            })
            .from(schema.tweetMediaAnalyzer)
            .innerJoin(schema.tweetsAnalyzer, eq(schema.tweetMediaAnalyzer.tweetId, schema.tweetsAnalyzer.id))
            .where(and(eq(schema.tweetsAnalyzer.username, username), isNull(schema.tweetMediaAnalyzer.description)))
            .orderBy(schema.tweetsAnalyzer.createdAt);
    }

    /*
    * Update media descriptions for a tweet after AI processing
    */
    static async updateMediaDescriptions(media: schema.TweetMediaAnalyzer): Promise<void> {
        await getDb()
            .update(schema.tweetMediaAnalyzer)
            .set({
                description: media.description,
                updatedAt: media.updatedAt
            })
            .where(eq(schema.tweetMediaAnalyzer.id, media.id));

        // Update tweet status to indicate visual processing is complete
        const tweetId = media.tweetId;
        await getDb()
            .update(schema.tweetsAnalyzer)
            .set({
                status: 'visual_processed',
                updatedAt: new Date()
            })
            .where(eq(schema.tweetsAnalyzer.id, tweetId));
    }

    static async getTweetsAnalysisViewByUsername(username: string): Promise<TweetAnalysisView[]> {
        const db = getDb();
        
        // Get tweets with their media using a left join to include tweets without media
        const bestTweets = await db
            .select({
                id: schema.tweetsAnalyzer.id,
                tweetType: schema.tweetsAnalyzer.type,
                text: schema.tweetsAnalyzer.text,
                retweetCount: schema.tweetsAnalyzer.retweetCount,
                replyCount: schema.tweetsAnalyzer.replyCount,
                likeCount: schema.tweetsAnalyzer.likeCount,
                quoteCount: schema.tweetsAnalyzer.quoteCount,
                viewCount: schema.tweetsAnalyzer.viewCount,
                bookmarkCount: schema.tweetsAnalyzer.bookmarkCount,
            })
            .from(schema.tweetsAnalyzer)
            .where(eq(schema.tweetsAnalyzer.username, username))
            .orderBy(desc(schema.tweetsAnalyzer.evs))
            .limit(10);

        // get media for each tweet
        const media = await db
            .select({
                tweetId: schema.tweetMediaAnalyzer.tweetId,
                type: schema.tweetMediaAnalyzer.type,
                description: schema.tweetMediaAnalyzer.description,
            })
            .from(schema.tweetMediaAnalyzer)
            .where(inArray(schema.tweetMediaAnalyzer.tweetId, bestTweets.map(tweet => tweet.id)));

        return bestTweets.map(tweet => ({
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
}
