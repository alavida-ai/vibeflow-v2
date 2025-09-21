import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TwitterPipeline } from '../../pipelines/tweets-pipeline'
import { TweetTransformer } from '../../transformers/TweetTransformer'
import { TweetSink } from '../../sinks/TweetSink'
import { UserMentionsEndpoint } from '../../sources/endpoints'
import { 
  mockTwitterClient, 
  mockTwitterService, 
  createMockApiTweet, 
  createMockTweetsApiResponse,
  createMockTweetWithMedia 
} from '../test-utils'

describe('TwitterPipeline Integration', () => {
  let pipeline: TwitterPipeline
  let mockClient: ReturnType<typeof mockTwitterClient>
  let mockService: ReturnType<typeof mockTwitterService>

  beforeEach(() => {
    // Reset all mocks first
    vi.clearAllMocks()
    
    mockClient = mockTwitterClient()
    mockService = mockTwitterService()

    const endpoint = new UserMentionsEndpoint(mockClient as any)
    const transformer = new TweetTransformer()
    const sink = new TweetSink()

    pipeline = new TwitterPipeline({
      source: endpoint,
      transformer,
      sink,
      processors: []
    })
  })

  describe('run', () => {
    it('should successfully process a complete pipeline flow', async () => {
      // Setup mock data
      const mockTweet = createMockApiTweet({
        id: '1234567890',
        text: 'Test tweet for pipeline',
        author: {
          id: 'author123',
          userName: 'testuser',
          name: 'Test User',
          followers: 1000
        } as any
      })

      const mockApiResponse = createMockTweetsApiResponse({
        tweets: [mockTweet],
        has_next_page: false,
        next_cursor: null
      })

      const expectedSavedTweet = createMockTweetWithMedia({
        id: 1,
        apiId: '1234567890',
        text: 'Test tweet for pipeline',
        authorId: 'author123',
        authorUsername: 'testuser',
        authorName: 'Test User',
        authorFollowers: 1000
      })

      // Mock the API response
      mockClient.getUserMentions.mockResolvedValueOnce(mockApiResponse)

      // Mock the database save
      mockService.insertTweetsWithMedia.mockResolvedValueOnce([expectedSavedTweet])

      // Run the pipeline
      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      })

      // Verify the result
      expect(result.success).toBe(true)
      expect(result.totalTweets).toBe(1)
      expect(result.savedTweets).toHaveLength(1)
      expect(result.savedTweets[0]).toMatchObject({
        apiId: '1234567890',
        text: 'Test tweet for pipeline',
        authorUsername: 'testuser'
      })
      expect(result.pagesProcessed).toBe(1)
      expect(result.hasMorePages).toBe(false)
      expect(result.nextCursor).toBeUndefined()

      // Verify API was called correctly
      expect(mockClient.getUserMentions).toHaveBeenCalledWith({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01'),
        cursor: undefined
      })

      // Verify database was called correctly
      expect(mockService.insertTweetsWithMedia).toHaveBeenCalledWith([
        expect.objectContaining({
          apiId: '1234567890',
          text: 'Test tweet for pipeline',
          source: 'user-mentions'
        })
      ])
    })

    it('should handle multiple pages correctly', async () => {
      // Setup mock data for multiple pages
      const mockTweet1 = createMockApiTweet({ id: '1', text: 'Tweet 1' })
      const mockTweet2 = createMockApiTweet({ id: '2', text: 'Tweet 2' })

      const page1Response = createMockTweetsApiResponse({
        tweets: [mockTweet1],
        has_next_page: true,
        next_cursor: 'cursor-page-2'
      })

      const page2Response = createMockTweetsApiResponse({
        tweets: [mockTweet2],
        has_next_page: false,
        next_cursor: null
      })

      const savedTweet1 = createMockTweetWithMedia({ id: 1, apiId: '1', text: 'Tweet 1' })
      const savedTweet2 = createMockTweetWithMedia({ id: 2, apiId: '2', text: 'Tweet 2' })

      // Mock API responses for both pages
      mockClient.getUserMentions
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response)

      // Mock database saves
      mockService.insertTweetsWithMedia
        .mockResolvedValueOnce([savedTweet1])
        .mockResolvedValueOnce([savedTweet2])

      // Run the pipeline
      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      })

      // Verify the result
      expect(result.success).toBe(true)
      expect(result.totalTweets).toBe(2)
      expect(result.pagesProcessed).toBe(2)
      expect(result.hasMorePages).toBe(false)

      // Verify API was called for both pages
      expect(mockClient.getUserMentions).toHaveBeenCalledTimes(2)
      expect(mockClient.getUserMentions).toHaveBeenNthCalledWith(1, {
        userName: 'testuser',
        sinceTime: new Date('2024-01-01'),
        cursor: undefined
      })
      expect(mockClient.getUserMentions).toHaveBeenNthCalledWith(2, {
        userName: 'testuser',
        sinceTime: new Date('2024-01-01'),
        cursor: 'cursor-page-2'
      })

      // Verify database was called for both batches
      expect(mockService.insertTweetsWithMedia).toHaveBeenCalledTimes(2)
    })

    it('should respect maxPages option', async () => {
      const mockResponse = createMockTweetsApiResponse({
        tweets: [createMockApiTweet()],
        has_next_page: true,
        next_cursor: 'cursor-next'
      })

      mockClient.getUserMentions.mockResolvedValue(mockResponse)
      mockService.insertTweetsWithMedia.mockResolvedValue([createMockTweetWithMedia()])

      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      }, { maxPages: 1 })

      expect(result.success).toBe(true)
      expect(result.pagesProcessed).toBe(1)
      expect(result.hasMorePages).toBe(true)
      expect(result.nextCursor).toBe('cursor-next')
      expect(mockClient.getUserMentions).toHaveBeenCalledTimes(1)
    })

    it('should handle empty response gracefully', async () => {
      const mockResponse = createMockTweetsApiResponse({
        tweets: [],
        has_next_page: false,
        next_cursor: null
      })

      mockClient.getUserMentions.mockResolvedValueOnce(mockResponse)

      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      })

      expect(result.success).toBe(true)
      expect(result.totalTweets).toBe(0)
      expect(result.savedTweets).toHaveLength(0)
      expect(result.pagesProcessed).toBe(1)
      expect(result.hasMorePages).toBe(false)

      // Should not call database if no tweets
      expect(mockService.insertTweetsWithMedia).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API rate limit exceeded')
      mockClient.getUserMentions.mockRejectedValueOnce(apiError)

      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('API rate limit exceeded')
      expect(result.totalTweets).toBe(0)
      expect(result.pagesProcessed).toBe(1) // Page count increments before API call
      expect(result.hasMorePages).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      const mockResponse = createMockTweetsApiResponse({
        tweets: [createMockApiTweet()]
      })

      mockClient.getUserMentions.mockResolvedValueOnce(mockResponse)

      const dbError = new Error('Database connection failed')
      mockService.insertTweetsWithMedia.mockRejectedValueOnce(dbError)

      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.totalTweets).toBe(0)
      expect(result.pagesProcessed).toBe(1)
    })

    it('should handle cursor-based pagination correctly', async () => {
      const mockResponse = createMockTweetsApiResponse({
        tweets: [createMockApiTweet()],
        has_next_page: true,
        next_cursor: 'cursor-123'
      })

      mockClient.getUserMentions.mockResolvedValueOnce(mockResponse)
      mockService.insertTweetsWithMedia.mockResolvedValue([createMockTweetWithMedia()])

      const result = await pipeline.run({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01')
      }, { 
        maxPages: 1 
      })

      expect(result.success).toBe(true)
      expect(result.nextCursor).toBe('cursor-123')
      
      // Should start with undefined cursor (beginning of pagination)
      expect(mockClient.getUserMentions).toHaveBeenCalledWith({
        userName: 'testuser',
        sinceTime: new Date('2024-01-01'),
        cursor: undefined
      })
    })
  })
})
