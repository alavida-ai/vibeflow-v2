import { getDb, schema } from "@brand-listener/database";

export namespace TwitterDatabaseService {

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
}