import { vi } from 'vitest'
import { schema } from '@vibeflow/database'
import { TwitterService } from '@vibeflow/core'

export function mockTwitterService() {
  const mockInsertTweetsWithMedia = vi.fn()
    .mockImplementation(async (tweets: schema.InsertTweetWithMedia[]) => {
      return tweets.map((tweet: schema.InsertTweetWithMedia, index: number) => {
        // Convert media to proper format with IDs
        const mediaWithIds = tweet.media.map((media, mediaIndex) => ({
          ...media,
          id: mediaIndex + 1,
          tweetId: index + 1,
          capturedAtUtc: tweet.capturedAtUtc || new Date(),
          updatedAtUtc: tweet.updatedAtUtc || new Date()
        }))
        
        // Return the tweet data as saved, preserving all original fields
        return {
          id: index + 1,
          apiId: tweet.apiId,
          text: tweet.text,
          language: tweet.language,
          url: tweet.url,
          authorId: tweet.authorId,
          authorUsername: tweet.authorUsername,
          authorName: tweet.authorName,
          authorFollowers: tweet.authorFollowers,
          conversationId: tweet.conversationId,
          isReply: tweet.isReply,
          inReplyToId: tweet.inReplyToId,
          inReplyToUsername: tweet.inReplyToUsername,
          likeCount: tweet.likeCount,
          replyCount: tweet.replyCount,
          retweetCount: tweet.retweetCount,
          quoteCount: tweet.quoteCount,
          viewCount: tweet.viewCount,
          bookmarkCount: tweet.bookmarkCount,
          createdAtUtc: tweet.createdAtUtc,
          capturedAtUtc: tweet.capturedAtUtc,
          updatedAtUtc: tweet.updatedAtUtc,
          source: tweet.source,
          rawJson: tweet.rawJson,
          media: mediaWithIds
        } as schema.TweetWithMedia
      })
    })

  vi.spyOn(TwitterService, 'insertTweetsWithMedia').mockImplementation(mockInsertTweetsWithMedia)

  return {
    insertTweetsWithMedia: mockInsertTweetsWithMedia
  }
}
