import {
    getDb,
    schema
} from "@brand-listener/database";
import { eq, and, isNull } from 'drizzle-orm';

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

    /**
     * Get all tweets
     */
    static async getAllTweets() {
        return await getDb()
            .select()
            .from(schema.tweetsAnalyzer)
            .orderBy(schema.tweetsAnalyzer.createdAt);
    }

    /**
     * Get tweet by database ID
     */
    static async getTweetById(id: number) {
        const result = await getDb()
            .select()
            .from(schema.tweetsAnalyzer)
            .where(eq(schema.tweetsAnalyzer.id, id))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Get tweet by API ID (external tweet ID)
     */
    static async getTweetByApiId(apiId: string) {
        const result = await getDb()
            .select()
            .from(schema.tweetsAnalyzer)
            .where(eq(schema.tweetsAnalyzer.apiId, apiId))
            .limit(1);
        return result[0] || null;
    }
}
