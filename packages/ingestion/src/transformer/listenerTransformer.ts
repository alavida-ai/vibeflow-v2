import { TwitterApiTweet, TwitterApiResponse } from "../client/twitter";
import { schema } from "@vibeflow/database";

/* -------------------------------------------------------------------------- */
/*                              FUNCTIONS                                     */
/* -------------------------------------------------------------------------- */

export function transformTweetToDbFormat(tweet: TwitterApiTweet, capturedAt: Date = new Date()): schema.InsertTweet {
  // Parse the Twitter date format: "Tue Aug 26 12:20:57 +0000 2025"
  const createdAt = new Date(tweet.createdAt);

  return {
    tweetId: tweet.id,
    text: tweet.text,
    language: tweet.lang || null,
    tweetUrl: tweet.twitterUrl,

    // Author information
    authorId: tweet.author.id,
    authorUsername: tweet.author.userName || null,
    authorName: tweet.author.name || null,
    authorFollowers: tweet.author.followers || 0,

    // Threading/context
    conversationId: tweet.conversationId || null,
    isReply: tweet.isReply,
    inReplyToId: tweet.inReplyToId || null,
    inReplyToUsername: tweet.inReplyToUsername || null,

    // Engagement metrics
    likeCount: tweet.likeCount,
    replyCount: tweet.replyCount,
    retweetCount: tweet.retweetCount,
    quoteCount: tweet.quoteCount,
    viewCount: tweet.viewCount,

    // Timestamps
    createdAtUtc: createdAt,
    capturedAtUtc: capturedAt,
    updatedAt: capturedAt,

    // Pipeline state
    status: "pending" as const,
    errors: [],

    // Metadata
    source: "mentions",
    rawJson: tweet,
  };
}

/**
 * Transform Twitter API response to database insert format
 */
export function transformTwitterResponse(apiResponse: TwitterApiResponse): {
  tweets: schema.InsertTweet[];
  hasNextPage: boolean;
  nextCursor?: string | null;
} {
  const capturedAt = new Date();

  const transformedTweets = apiResponse.tweets.map(tweet =>
    transformTweetToDbFormat(tweet, capturedAt)
  );

  return {
    tweets: transformedTweets,
    hasNextPage: apiResponse.has_next_page,
    nextCursor: apiResponse.next_cursor,
  };
}