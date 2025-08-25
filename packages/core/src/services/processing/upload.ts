import type { Tweet } from '@brand-listener/types';
import { Database } from '@brand-listener/database';
import type { SchemaTypes } from '@brand-listener/database';

export async function uploadTweetsToDB(tweets: Tweet[]): Promise<void> {
  console.log('Uploading tweets to DB', tweets);
  for (const tweet of tweets) {
    await uploadTweetToDB(tweet);
  }
}   

export async function uploadTweetToDB({
    tweet,
    runId
}): Promise<void> {
  const result = await Database.client.insert(Database.tables.tweetsTable).values({
    runId,
    text: tweet.text,   
    tweetId: tweet.id,
    tweetUrl: tweet.url,
    authorUsername: tweet.author.userName,
    authorName: tweet.author.name,
    authorFollowers: tweet.author.followers,
    createdAtUtc: tweet.createdAt,
    capturedAtUtc: tweet.createdAt,
    status: 'pending'
  });
  console.log('Tweet uploaded to DB', result);
}   