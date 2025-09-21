import { describe, it, expect } from 'vitest'
import { TweetTransformer } from '../../transformers/TweetTransformer'
import { createMockApiTweet, createMockApiTweetAuthor, createMockApiTweetWithPhoto } from '../test-utils'

describe('TweetTransformer', () => {
  const transformer = new TweetTransformer()

  describe('transform', () => {
    it('should transform basic tweet correctly', () => {
      const mockTweet = createMockApiTweet({
        id: '1234567890',
        text: 'Hello world!',
        lang: 'en',
        likeCount: 10,
        replyCount: 5,
        retweetCount: 2,
        quoteCount: 1,
        viewCount: 100,
        bookmarkCount: 3,
        isReply: false,
        conversationId: '1234567890',
        createdAt: '2024-01-01T12:00:00.000Z'
      })

      const result = transformer.transform(mockTweet, { source: 'user-mentions' })

      expect(result).toMatchObject({
        apiId: '1234567890',
        text: 'Hello world!',
        language: 'en',
        source: 'user-mentions',
        likeCount: 10,
        replyCount: 5,
        retweetCount: 2,
        quoteCount: 1,
        viewCount: 100,
        bookmarkCount: 3,
        isReply: false,
        conversationId: '1234567890',
        type: 'text',
        media: []
      })

      expect(result.createdAtUtc).toEqual(new Date('2024-01-01T12:00:00.000Z'))
      expect(result.capturedAtUtc).toBeInstanceOf(Date)
      expect(result.updatedAtUtc).toBeInstanceOf(Date)
      expect(result.rawJson).toEqual(mockTweet)
    })

    it('should handle reply tweets correctly', () => {
      const mockTweet = createMockApiTweet({
        isReply: true,
        inReplyToId: '9876543210',
        inReplyToUsername: 'originaluser',
        conversationId: '9876543210'
      })

      const result = transformer.transform(mockTweet, { source: 'tweet-replies' })

      expect(result).toMatchObject({
        isReply: true,
        inReplyToId: '9876543210',
        inReplyToUsername: 'originaluser',
        conversationId: '9876543210',
        source: 'tweet-replies'
      })
    })

    it('should extract author information correctly', () => {
      const mockAuthor = createMockApiTweetAuthor({
        id: 'author123',
        userName: 'testuser',
        name: 'Test User',
        followers: 1000
      })

      const mockTweet = createMockApiTweet({
        author: mockAuthor
      })

      const result = transformer.transform(mockTweet, { source: 'user-mentions' })

      expect(result).toMatchObject({
        authorId: 'author123',
        authorUsername: 'testuser',
        authorName: 'Test User',
        authorFollowers: 1000
      })
    })

    it('should handle tweets with image media', () => {
      const mockTweet = createMockApiTweet({
        extendedEntities: {
          media: [{
            type: 'photo',
            media_url_https: 'https://example.com/image.jpg'
          }]
        }
      })

      const result = transformer.transform(mockTweet, { source: 'user-mentions' })

      expect(result.media).toHaveLength(1)
      expect(result.media[0]).toMatchObject({
        tweetId: mockTweet.id,
        type: 'photo',
        url: 'https://example.com/image.jpg',
        description: null
      })
    })

    it('should handle tweets with video media', () => {
      const mockTweet = createMockApiTweet({
        extendedEntities: {
          media: [{
            type: 'video',
            media_url_https: 'https://example.com/video.mp4',
            video_info: {
              variants: [
                {
                  url: 'https://example.com/video_low.mp4',
                  content_type: 'video/mp4',
                  bitrate: 320000
                },
                {
                  url: 'https://example.com/video_high.mp4',
                  content_type: 'video/mp4',
                  bitrate: 1280000
                }
              ]
            }
          }]
        }
      })

      const result = transformer.transform(mockTweet, { source: 'user-mentions' })

      expect(result.media).toHaveLength(1)
      expect(result.media[0]).toMatchObject({
        tweetId: mockTweet.id,
        type: 'video',
        url: 'https://example.com/video_high.mp4', // Should pick highest bitrate
        description: null
      })
    })

    it('should handle tweets without media', () => {
      const mockTweet = createMockApiTweet({
        extendedEntities: {
          media: []
        }
      })

      const result = transformer.transform(mockTweet, { source: 'user-mentions' })

      expect(result.media).toHaveLength(0)
    })

    it('should handle null/undefined values gracefully', () => {
      const mockTweet = createMockApiTweet({
        lang: undefined,
        conversationId: null,
        inReplyToId: null,
        inReplyToUsername: null,
        bookmarkCount: undefined
      })

      const result = transformer.transform(mockTweet, { source: 'user-mentions' })

      expect(result).toMatchObject({
        language: null,
        conversationId: null,
        inReplyToId: null,
        inReplyToUsername: null,
        bookmarkCount: 0 // Should default to 0
      })
    })

    it('should handle photo media type from real API', () => {
      const tweet = createMockApiTweetWithPhoto({
        id: '1234567890',
        text: 'Tweet with photo'
      })

      const result = transformer.transform(tweet, { source: 'user-mentions' })

      expect(result.media).toHaveLength(1)
      expect(result.media[0].type).toBe('photo') // Should keep "photo" as per database enum
      expect(result.media[0].url).toBe('https://pbs.twimg.com/media/test.jpg')
    })
  })
})
