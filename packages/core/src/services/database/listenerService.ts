import { getDb, schema } from "@brand-listener/database";
import { eq, inArray, gt, and, ne, desc } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

export type TweetCandidate = {
    tweet: schema.Tweet;
    analytics: schema.TweetAnalytics;
}

/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

export const PENDING_TWEET_STATUS = schema.statusConstants.pending;
export const READY_TO_RESPOND_TWEET_STATUS = schema.statusConstants.ready_to_respond;
export const ERROR_TWEET_STATUS = schema.statusConstants.error;
export const PROCESSED_TWEET_STATUS = schema.statusConstants.processed;
export const REPLIED_TWEET_STATUS = schema.statusConstants.responded;

/* -------------------------------------------------------------------------- */
/*                              FUNCTIONS                                     */
/* -------------------------------------------------------------------------- */

export async function insertTweetsAndIgnoreDuplicates(tweets: schema.InsertTweet[]) {
    try {
  const db = getDb();
    const result = await db.insert(schema.tweetsTable).values(tweets).onConflictDoNothing(
        {
            target: [schema.tweetsTable.tweetId]
        }
    ).returning();
    return result;
  } catch (error) {
    console.error("Error inserting tweets", error);
        throw error;
    }
}

export async function getPendingTweets() {
    try {
        const db = getDb();
        const result = await db.select().from(schema.tweetsTable).where(eq(schema.tweetsTable.status, PENDING_TWEET_STATUS));
        return result;
    } catch (error) {
        console.error("Error getting pending tweets", error);
        throw error;
    }
}

export async function addReplyToTweet(tweetId: string, reply: string, reasoning: string): Promise<schema.Tweet> {
    try {
        const db = getDb();
        const result = await db.update(schema.tweetsTable).set({reply, reasoning, status: READY_TO_RESPOND_TWEET_STATUS}).where(eq(schema.tweetsTable.tweetId, tweetId)).returning();

        if (result.length === 0) {
            throw new Error("Tweet not found");
        }

        return result[0];
    } catch (error) {
        console.error("Error updating tweet status", error);
        throw error;
    }
}

export async function getMostRelevantTweetsToReplyTo({
    top_k = 10,
}): Promise<TweetCandidate[]> {
    try {
        const db = getDb();
        const result = await db
            .select({
                tweet: schema.tweetsTable,
                analytics: schema.tweetAnalyticsTable
            })
            .from(schema.tweetsTable)
            .innerJoin(
                schema.tweetAnalyticsTable,
                eq(schema.tweetsTable.tweetId, schema.tweetAnalyticsTable.tweetId)
            )
            .where(eq(schema.tweetsTable.status, READY_TO_RESPOND_TWEET_STATUS))
            .orderBy(desc(schema.tweetAnalyticsTable.finalScore))
            .limit(top_k);
        
        return result;
    } catch (error) {
        console.error("Error getting most relevant tweets to reply to", error);
        throw error;
    }
}

export async function addErrorToTweet(tweetId: string, error: string) {
    try {
        const db = getDb();
        await db.update(schema.tweetsTable).set({errors: [error], status: ERROR_TWEET_STATUS}).where(eq(schema.tweetsTable.tweetId, tweetId));
    } catch (error) {
        console.error("Error adding error to tweet", error);
        throw error;
    }
}

export async function setTweetStatus(tweetId: string, status: schema.Tweet["status"]) {
    try {   
        const db = getDb();
        await db.update(schema.tweetsTable).set({status}).where(eq(schema.tweetsTable.tweetId, tweetId));
        return true;
    } catch (error) {
        console.error("Error setting tweet status", error);
        throw error;
    }
}

export async function batchSetTweetStatus(tweetIds: string[], status: schema.Tweet["status"]) {
    try {
        const db = getDb();
        await db.update(schema.tweetsTable).set({status}).where(inArray(schema.tweetsTable.tweetId, tweetIds));
        return true;
    } catch (error) {
        console.error("Error setting tweet status", error);
        throw error;
    }
}

export async function addAnalyticsToTweet(analytics: schema.InsertTweetAnalytics) {
    try {
        const db = getDb();
        await db.insert(schema.tweetAnalyticsTable).values(analytics).onConflictDoUpdate({
            target: [schema.tweetAnalyticsTable.tweetId],
            set: {
                rawEngagementScore: schema.tweetAnalyticsTable.rawEngagementScore,
                normalizedEngagementScore: schema.tweetAnalyticsTable.normalizedEngagementScore,
                freshnessAdjustedScore: schema.tweetAnalyticsTable.freshnessAdjustedScore,
                finalScore: schema.tweetAnalyticsTable.finalScore,
                authorSizeNormalizationFactor: schema.tweetAnalyticsTable.authorSizeNormalizationFactor,
                freshnessDecayFactor: schema.tweetAnalyticsTable.freshnessDecayFactor,
                ageInHours: schema.tweetAnalyticsTable.ageInHours,
                shouldReply: schema.tweetAnalyticsTable.shouldReply,
                algorithmVersion: schema.tweetAnalyticsTable.algorithmVersion,
                computedAt: new Date()
            }
        });
        await setTweetStatus(analytics.tweetId, PROCESSED_TWEET_STATUS);
        console.log("Added analytics to tweet", analytics.tweetId);
    } catch (error) {
        console.error("Error adding analytics to tweet", error);
        throw error;
    }
}

export async function batchAddAnalyticsToTweets(analytics: schema.InsertTweetAnalytics[]) {
    try {
        const db = getDb();
        await db.insert(schema.tweetAnalyticsTable).values(analytics).onConflictDoUpdate({
            target: [schema.tweetAnalyticsTable.tweetId],
            set: {
                rawEngagementScore: schema.tweetAnalyticsTable.rawEngagementScore,
                normalizedEngagementScore: schema.tweetAnalyticsTable.normalizedEngagementScore,
                freshnessAdjustedScore: schema.tweetAnalyticsTable.freshnessAdjustedScore,
                finalScore: schema.tweetAnalyticsTable.finalScore,
                authorSizeNormalizationFactor: schema.tweetAnalyticsTable.authorSizeNormalizationFactor,
                freshnessDecayFactor: schema.tweetAnalyticsTable.freshnessDecayFactor,
                ageInHours: schema.tweetAnalyticsTable.ageInHours,
                shouldReply: schema.tweetAnalyticsTable.shouldReply,
                algorithmVersion: schema.tweetAnalyticsTable.algorithmVersion,
                computedAt: new Date()
            }
        });
        await batchSetTweetStatus(analytics.map(a => a.tweetId), PROCESSED_TWEET_STATUS);
        console.log("Added analytics to tweets", analytics.map(a => a.tweetId));
    } catch (error) {
        console.error("Error adding analytics to tweet", error);
        throw error;
    }
}

export async function getTweetAnalytics(tweetId: string) {
    try {
        const db = getDb();
        const result = await db.select().from(schema.tweetAnalyticsTable).where(eq(schema.tweetAnalyticsTable.tweetId, tweetId));
        return result;
    } catch (error) {
        console.error("Error getting tweet analytics", error);
        throw new Error("Error getting tweet analytics")    ;
    }
}

export async function getTweetCandidates() : Promise<TweetCandidate[]> {
    try {
        const db = getDb();
        const result = await db
            .select({
                tweet: schema.tweetsTable,
                analytics: schema.tweetAnalyticsTable
            })
            .from(schema.tweetsTable)
            .innerJoin(
                schema.tweetAnalyticsTable,
                eq(schema.tweetsTable.tweetId, schema.tweetAnalyticsTable.tweetId)
            )
            .where(
                and(
                    gt(schema.tweetAnalyticsTable.finalScore, "5"),
                    eq(schema.tweetsTable.isReply, false),
                    ne(schema.tweetsTable.status, REPLIED_TWEET_STATUS),
                    ne(schema.tweetsTable.status, ERROR_TWEET_STATUS),
                    ne(schema.tweetsTable.status, READY_TO_RESPOND_TWEET_STATUS)
                )
            );
        return result;
    } catch (error) {
        console.error("Error getting tweet candidates", error);
        throw error;
    }
}
