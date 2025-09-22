import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TweetSink } from '../../sinks/tweet-sink'
import { mockTwitterService, createMockTweetWithMedia } from '../test-utils'
import { schema } from '@vibeflow/database'

describe('TweetSink', () => {
  let sink: TweetSink
  let mockService: ReturnType<typeof mockTwitterService>

  beforeEach(() => {
    sink = new TweetSink()
    mockService = mockTwitterService()
  })

  describe('save', () => {
    it('should save tweets using TwitterService', async () => {
      const mockInsertTweets: schema.InsertTweetWithMedia[] = [
        {
          apiId: '1234567890',
          text: 'Test tweet 1',
          language: 'en',
          url: 'https://twitter.com/test/status/1234567890',
          authorId: 'author1',
          authorUsername: 'testuser1',
          authorName: 'Test User 1',
          authorFollowers: 100,
          conversationId: '1234567890',
          isReply: false,
          inReplyToId: null,
          inReplyToUsername: null,
          likeCount: 10,
          replyCount: 2,
          retweetCount: 5,
          quoteCount: 1,
          viewCount: 100,
          bookmarkCount: 3,
          createdAtUtc: new Date('2024-01-01T12:00:00.000Z'),
          capturedAtUtc: new Date(),
          updatedAtUtc: new Date(),
          source: 'user-mentions',
          rawJson: {},
          media: []
        },
        {
          apiId: '1234567891',
          text: 'Test tweet 2',
          language: 'en',
          url: 'https://twitter.com/test/status/1234567891',
          authorId: 'author2',
          authorUsername: 'testuser2',
          authorName: 'Test User 2',
          authorFollowers: 200,
          conversationId: '1234567891',
          isReply: false,
          inReplyToId: null,
          inReplyToUsername: null,
          likeCount: 20,
          replyCount: 4,
          retweetCount: 10,
          quoteCount: 2,
          viewCount: 200,
          bookmarkCount: 6,
          createdAtUtc: new Date('2024-01-01T13:00:00.000Z'),
          capturedAtUtc: new Date(),
          updatedAtUtc: new Date(),
          source: 'user-mentions',
          rawJson: {},
          media: []
        }
      ]

      const result = await sink.save(mockInsertTweets)

      expect(mockService.insertTweetsWithMedia).toHaveBeenCalledWith(mockInsertTweets)
      expect(mockService.insertTweetsWithMedia).toHaveBeenCalledTimes(1)
      
      // Verify the structure and key fields rather than exact equality
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 1,
        apiId: '1234567890',
        text: 'Test tweet 1',
        authorId: 'author1',
        authorUsername: 'testuser1',
        source: 'user-mentions'
      })
      expect(result[1]).toMatchObject({
        id: 2,
        apiId: '1234567891',
        text: 'Test tweet 2',
        authorId: 'author2',
        authorUsername: 'testuser2',
        source: 'user-mentions'
      })
    })

    it('should handle empty tweet array', async () => {
      const result = await sink.save([])

      expect(mockService.insertTweetsWithMedia).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it('should propagate database errors', async () => {
      const mockError = new Error('Database connection failed')
      mockService.insertTweetsWithMedia.mockRejectedValueOnce(mockError)

      const mockTweets: schema.InsertTweetWithMedia[] = [{
        apiId: '1234567890',
        text: 'Test tweet',
        language: 'en',
        url: 'https://twitter.com/test/status/1234567890',
        authorId: 'author1',
        authorUsername: 'testuser',
        authorName: 'Test User',
        authorFollowers: 100,
        conversationId: '1234567890',
        isReply: false,
        inReplyToId: null,
        inReplyToUsername: null,
        likeCount: 10,
        replyCount: 2,
        retweetCount: 5,
        quoteCount: 1,
        viewCount: 100,
        bookmarkCount: 3,
        createdAtUtc: new Date(),
        capturedAtUtc: new Date(),
        updatedAtUtc: new Date(),
        source: 'user-mentions',
        rawJson: {},
        media: []
      }]

      await expect(sink.save(mockTweets)).rejects.toThrow('Database connection failed')
    })
  })
})
