import { getDb, schema } from "@brand-listener/database";
import { eq } from "drizzle-orm";

export namespace TwitterDatabaseService {

  /* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

export const PENDING_TWEET_STATUS = schema.statusConstants.pending;
export const READY_TO_RESPOND_TWEET_STATUS = schema.statusConstants.ready_to_respond;

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
}