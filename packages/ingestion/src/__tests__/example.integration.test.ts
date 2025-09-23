import { describe, it, expect, beforeEach } from 'vitest'
import { createMentionsPipeline } from '../pipelines/factories'
import { mockTwitterClient, mockTwitterService, createMockTweetsApiResponse, createMockApiTweet, createMockTweetWithMedia } from './test-utils'

/**
 * Example integration test showing how to test the complete ingestion pipeline
 * This demonstrates testing the full flow from API -> Transform -> Database
 */
describe('Ingestion Pipeline Example Integration', () => {
  let mockClient: ReturnType<typeof mockTwitterClient>
  let mockService: ReturnType<typeof mockTwitterService>

  beforeEach(() => {
    mockClient = mockTwitterClient()
    mockService = mockTwitterService()
  })

  it('should demonstrate complete pipeline flow', async () => {
    // Arrange: Set up your test data
    const testParams = {
      userName: 'vibeflow_user',
      sinceTime: new Date('2024-01-01T00:00:00Z')
    }

    const mockApiTweet = createMockApiTweet({
      id: '1234567890',
      text: 'This is a test tweet from @vibeflow_user about #AI and #automation',
      author: {
        id: 'user123',
        userName: 'vibeflow_user',
        name: 'VibeFlow User',
        followers: 5000
      } as any,
      likeCount: 42,
      retweetCount: 12,
      replyCount: 8,
      viewCount: 1500
    })

    const mockApiResponse = createMockTweetsApiResponse({
      tweets: [mockApiTweet],
      has_next_page: false,
      next_cursor: null
    })

    const expectedSavedTweet = createMockTweetWithMedia({
      id: 1,
      apiId: '1234567890',
      text: 'This is a test tweet from @vibeflow_user about #AI and #automation',
      authorId: 'user123',
      authorUsername: 'vibeflow_user',
      authorName: 'VibeFlow User',
      authorFollowers: 5000,
      likeCount: 42,
      retweetCount: 12,
      replyCount: 8,
      viewCount: 1500,
      source: 'user-mentions'
    })

    // Mock the external dependencies
    mockClient.getUserMentions.mockResolvedValueOnce(mockApiResponse)
    mockService.insertTweetsWithMedia.mockResolvedValueOnce([expectedSavedTweet])

    // Act: Run the pipeline
    const pipeline = createMentionsPipeline()
    const result = await pipeline.run(testParams)

    // Assert: Verify the complete flow worked
    expect(result.success).toBe(true)
    expect(result.totalTweets).toBe(1)
    expect(result.savedTweets).toHaveLength(1)
    
    const savedTweet = result.savedTweets[0]
    expect(savedTweet).toMatchObject({
      apiId: '1234567890',
      text: 'This is a test tweet from @vibeflow_user about #AI and #automation',
      authorUsername: 'vibeflow_user',
      authorName: 'VibeFlow User',
      authorFollowers: 5000,
      likeCount: 42,
      source: 'user-mentions'
    })

    // Verify external calls were made correctly
    expect(mockClient.getUserMentions).toHaveBeenCalledWith({
      userName: 'vibeflow_user',
      sinceTime: new Date('2024-01-01T00:00:00Z'),
      cursor: undefined
    })

    expect(mockService.insertTweetsWithMedia).toHaveBeenCalledWith([
      expect.objectContaining({
        apiId: '1234567890',
        text: 'This is a test tweet from @vibeflow_user about #AI and #automation',
        source: 'user-mentions',
        authorId: 'user123',
        authorUsername: 'vibeflow_user'
      })
    ])
  })

  it('should handle real-world error scenarios', async () => {
    // Test network timeout
    mockClient.getUserMentions.mockRejectedValueOnce(new Error('Request timeout'))

    const pipeline = createMentionsPipeline()
    const result = await pipeline.run({
      userName: 'test_user',
      sinceTime: new Date()
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Request timeout')
    expect(result.totalTweets).toBe(0)
  })
})
