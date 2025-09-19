import { getDb, schema } from "@vibeflow/database";
import { eq, inArray, gt, and, ne, desc, or, isNull } from "drizzle-orm";

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

export const PENDING_TWEET_STATUS = schema.replyStatusConstants.pending;
export const READY_TO_RESPOND_TWEET_STATUS = schema.replyStatusConstants.ready_to_respond;
export const ERROR_TWEET_STATUS = schema.replyStatusConstants.error;
export const PROCESSED_TWEET_STATUS = schema.replyStatusConstants.processed;
export const REPLIED_TWEET_STATUS = schema.replyStatusConstants.responded;

/* -------------------------------------------------------------------------- */
/*                              FUNCTIONS                                     */
/* -------------------------------------------------------------------------- */

export async function insertTweetsAndIgnoreDuplicates(tweets: schema.InsertTweet[]) {
    try {
        const db = getDb();
        const result = await db
            .insert(schema.tweets)
            .values(tweets)
            .onConflictDoNothing(
                {
                    target: [schema.tweets.id]
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
        // Get tweets that either have no reply entry (pending) or have pending status
        const result = await db
            .select({
                tweet: schema.tweets
            })
            .from(schema.tweets)
            .leftJoin(
                schema.tweetReplies,
                eq(schema.tweets.id, schema.tweetReplies.tweetId)
            )
            .where(
                or(
                    isNull(schema.tweetReplies.status), // No reply entry = pending
                    eq(schema.tweetReplies.status, PENDING_TWEET_STATUS)
                )
            );

        return result.map(r => r.tweet);
    } catch (error) {
        console.error("Error getting pending tweets", error);
        throw error;
    }
}

export async function addReplyToTweet(tweetId: number, reply: string, reasoning: string): Promise<schema.TweetReply> {
    try {
        const db = getDb();

        // First check if tweet exists
        const tweet = await db.select().from(schema.tweets).where(eq(schema.tweets.id, tweetId)).limit(1);
        if (tweet.length === 0) {
            throw new Error("Tweet not found");
        }

        // Insert or update reply in tweet_replies table
        const result = await db
            .insert(schema.tweetReplies)
            .values({
                tweetId,
                reply,
                reasoning,
                status: READY_TO_RESPOND_TWEET_STATUS,
                createdAtUtc: new Date(),
                updatedAtUtc: new Date()
            })
            .onConflictDoUpdate({
                target: schema.tweetReplies.tweetId,
                set: {
                    reply,
                    reasoning,
                    status: READY_TO_RESPOND_TWEET_STATUS,
                    updatedAtUtc: new Date()
                }
            })
            .returning();

        if (result.length === 0) {
            throw new Error("Failed to create/update reply");
        }

        return result[0];
    } catch (error) {
        console.error("Error adding reply to tweet", error);
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
                tweet: schema.tweets,
                analytics: schema.tweetAnalytics
            })
            .from(schema.tweets)
            .innerJoin(
                schema.tweetAnalytics,
                eq(schema.tweets.id, schema.tweetAnalytics.tweetId)
            )
            .innerJoin(
                schema.tweetReplies,
                eq(schema.tweets.id, schema.tweetReplies.tweetId)
            )
            .where(eq(schema.tweetReplies.status, READY_TO_RESPOND_TWEET_STATUS))
            .orderBy(desc(schema.tweetAnalytics.finalScore))
            .limit(top_k);

        return result;
    } catch (error) {
        console.error("Error getting most relevant tweets to reply to", error);
        throw error;
    }
}

export async function addErrorToTweetReply(tweetId: number, error: string) {
    try {
        const db = getDb();
        // Insert or update reply with error
        await db
            .insert(schema.tweetReplies)
            .values({
                tweetId,
                errors: [error],
                status: ERROR_TWEET_STATUS,
                createdAtUtc: new Date(),
                updatedAtUtc: new Date()
            })
            .onConflictDoUpdate({
                target: schema.tweetReplies.tweetId,
                set: {
                    errors: [error],
                    status: ERROR_TWEET_STATUS,
                    updatedAtUtc: new Date()
                }
            });
    } catch (error) {
        console.error("Error adding error to tweet reply", error);
        throw error;
    }
}

export async function setTweetReplyStatus(tweetId: number, status: schema.TweetReply["status"]) {
    try {
        const db = getDb();
        // Insert or update reply status
        await db
            .insert(schema.tweetReplies)
            .values({
                tweetId,
                status,
                createdAtUtc: new Date(),
                updatedAtUtc: new Date()
            })
            .onConflictDoUpdate({
                target: schema.tweetReplies.tweetId,
                set: {
                    status,
                    updatedAtUtc: new Date()
                }
            });
        return true;
    } catch (error) {
        console.error("Error setting tweet reply status", error);
        throw error;
    }
}

export async function batchSetTweetReplyStatus(tweetIds: number[], status: schema.TweetReply["status"]) {
    try {
        const db = getDb();
        // Insert or update reply status for multiple tweets
        const values = tweetIds.map(tweetId => ({
            tweetId,
            status,
            createdAtUtc: new Date(),
            updatedAtUtc: new Date()
        }));

        for (const value of values) {
            await db
                .insert(schema.tweetReplies)
                .values(value)
                .onConflictDoUpdate({
                    target: schema.tweetReplies.tweetId,
                    set: {
                        status: value.status,
                        updatedAtUtc: value.updatedAtUtc
                    }
                });
        }
        return true;
    } catch (error) {
        console.error("Error batch setting tweet reply status", error);
        throw error;
    }
}

export async function addAnalyticsToTweet(analytics: schema.InsertTweetAnalytics) {
    try {
        const db = getDb();
        await db.insert(schema.tweetAnalytics).values(analytics).onConflictDoUpdate({
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
        await setTweetReplyStatus(analytics.tweetId, PROCESSED_TWEET_STATUS);
        console.log("Added analytics to tweet", analytics.tweetId);
    } catch (error) {
        console.error("Error adding analytics to tweet", error);
        throw error;
    }
}

export async function batchAddAnalyticsToTweets(analytics: schema.InsertTweetAnalytics[]) {
    try {
        const db = getDb();
        await db.insert(schema.tweetAnalytics).values(analytics).onConflictDoUpdate({
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
        await batchSetTweetReplyStatus(analytics.map(a => a.tweetId), PROCESSED_TWEET_STATUS);
        console.log("Added analytics to tweets", analytics.map(a => a.tweetId));
    } catch (error) {
        console.error("Error adding analytics to tweet", error);
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

export async function getTweetCandidates(): Promise<TweetCandidate[]> {
    try {
        const db = getDb();
        const result = await db
            .select({
                tweet: schema.tweets,
                analytics: schema.tweetAnalytics
            })
            .from(schema.tweets)
            .innerJoin(
                schema.tweetAnalytics,
                eq(schema.tweets.id, schema.tweetAnalytics.tweetId)
            )
            .leftJoin(
                schema.tweetReplies,
                eq(schema.tweets.id, schema.tweetReplies.tweetId)
            )
            .where(
                and(
                    gt(schema.tweetAnalytics.finalScore, "5"),
                    eq(schema.tweets.isReply, false),
                    // Exclude tweets that already have replies in certain statuses
                    or(
                        isNull(schema.tweetReplies.status), // No reply entry = candidate
                        and(
                            ne(schema.tweetReplies.status, REPLIED_TWEET_STATUS),
                            ne(schema.tweetReplies.status, ERROR_TWEET_STATUS),
                            ne(schema.tweetReplies.status, READY_TO_RESPOND_TWEET_STATUS)
                        )
                    )
                )
            );
        return result;
    } catch (error) {
        console.error("Error getting tweet candidates", error);
        throw error;
    }
}
