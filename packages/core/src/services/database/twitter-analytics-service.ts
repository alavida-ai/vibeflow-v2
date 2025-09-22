import { getDb, schema } from "@vibeflow/database";
import { eq } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/*                              FUNCTIONS                                     */
/* -------------------------------------------------------------------------- */

// Shared upsert configuration for analytics
const getAnalyticsUpsertConfig = () => ({
    target: [schema.tweetAnalytics.tweetId],
    set: {
        rawEngagementScore: schema.tweetAnalytics.rawEngagementScore,
        normalizedEngagementScore: schema.tweetAnalytics.normalizedEngagementScore,
        freshnessAdjustedScore: schema.tweetAnalytics.freshnessAdjustedScore,
        finalScore: schema.tweetAnalytics.finalScore,
        authorSizeNormalizationFactor: schema.tweetAnalytics.authorSizeNormalizationFactor,
        freshnessDecayFactor: schema.tweetAnalytics.freshnessDecayFactor,
        ageInHours: schema.tweetAnalytics.ageInHours,
        shouldReply: schema.tweetAnalytics.shouldReply,
        algorithmVersion: schema.tweetAnalytics.algorithmVersion,
        computedAtUtc: new Date()
    }
});

export async function addAnalyticsToTweet(analytics: schema.InsertTweetAnalytics) {
    return await batchAddAnalyticsToTweets([analytics]);
}

export async function batchAddAnalyticsToTweets(analytics: schema.InsertTweetAnalytics[]): Promise<void> {
    try {
        const db = getDb();
        await db.insert(schema.tweetAnalytics).values(analytics).onConflictDoUpdate(getAnalyticsUpsertConfig());
        
        const tweetIds = analytics.map(a => a.tweetId);
        console.log(`Added analytics to ${tweetIds.length} tweet(s):`, tweetIds);
    } catch (error) {
        console.error("Error adding analytics to tweets:", error);
        throw error;
    }
}

export async function getTweetAnalytics(tweetId: number) {
    try {
        const db = getDb();
        const result = await db
            .select()
            .from(schema.tweetAnalytics)
            .where(eq(schema.tweetAnalytics.tweetId, tweetId));
        return result;
    } catch (error) {
        console.error("Error getting tweet analytics", error);
        throw new Error("Error getting tweet analytics");
    }
}