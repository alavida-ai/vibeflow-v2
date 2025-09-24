import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserMentionsEndpoint, UserLastTweetsEndpoint, TweetRepliesEndpoint } from '../../sources/endpoints'
import { mockTwitterClient, createMockTweetsApiResponse, createMockUserLastTweetsApiResponse, createMockApiTweet } from '../test-utils'

describe('Twitter Endpoints', () => {
    let mockClient: ReturnType<typeof mockTwitterClient>

    beforeEach(() => {
        mockClient = mockTwitterClient()
    })

    describe('UserMentionsEndpoint', () => {
        let endpoint: UserMentionsEndpoint

        beforeEach(() => {
            endpoint = new UserMentionsEndpoint(mockClient as any)
        })

        it('should fetch user mentions successfully', async () => {
            const mockTweet = createMockApiTweet({ id: '123', text: 'Test mention' })
            const mockResponse = createMockTweetsApiResponse({
                tweets: [mockTweet],
                has_next_page: true,
                next_cursor: 'next-cursor-123'
            })

            mockClient.getUserMentions.mockResolvedValueOnce(mockResponse)

            const result = await endpoint.fetch({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01')
            }, 'cursor-123')

            expect(mockClient.getUserMentions).toHaveBeenCalledWith({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01'),
                cursor: 'cursor-123'
            })

            expect(result).toEqual({
                tweets: [mockTweet],
                hasNextPage: true,
                nextCursor: 'next-cursor-123'
            })
        })

        it('should handle fetch without cursor', async () => {
            const mockResponse = createMockTweetsApiResponse()
            mockClient.getUserMentions.mockResolvedValueOnce(mockResponse)

            const result = await endpoint.fetch({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01')
            })

            expect(mockClient.getUserMentions).toHaveBeenCalledWith({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01'),
                cursor: undefined
            })

            expect(result).toEqual({
                tweets: mockResponse.tweets,
                hasNextPage: mockResponse.has_next_page,
                nextCursor: mockResponse.next_cursor
            })
        })

        it('should propagate client errors', async () => {
            const error = new Error('API error')
            mockClient.getUserMentions.mockRejectedValueOnce(error)

            await expect(endpoint.fetch({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01')
            })).rejects.toThrow('API error')
        })
    })

    describe('UserLastTweetsEndpoint', () => {
        let endpoint: UserLastTweetsEndpoint

        beforeEach(() => {
            endpoint = new UserLastTweetsEndpoint(mockClient as any)
        })

        it('should fetch user last tweets successfully', async () => {
            const mockTweet = createMockApiTweet({ id: '456', text: 'Test last tweet' })
            const mockResponse = createMockUserLastTweetsApiResponse({
                data: { tweets: [mockTweet] },
                has_next_page: true,
                next_cursor: 'next-cursor-456'
            })

            mockClient.getUserLastTweets.mockResolvedValueOnce(mockResponse)

            const result = await endpoint.fetch({
                userName: 'testuser'
            }, 'cursor-456')

            expect(mockClient.getUserLastTweets).toHaveBeenCalledWith('testuser', 'cursor-456')

            expect(result).toEqual({
                tweets: [mockTweet],
                hasNextPage: true,
                nextCursor: 'next-cursor-456'
            })
        })

        it('should handle fetch without cursor', async () => {
            const mockResponse = createMockUserLastTweetsApiResponse()
            mockClient.getUserLastTweets.mockResolvedValueOnce(mockResponse)

            const result = await endpoint.fetch({
                userName: 'testuser'
            })

            expect(mockClient.getUserLastTweets).toHaveBeenCalledWith('testuser', undefined)

            expect(result).toEqual({
                tweets: mockResponse.data.tweets,
                hasNextPage: mockResponse.has_next_page,
                nextCursor: mockResponse.next_cursor
            })
        })

        it('should propagate client errors', async () => {
            const error = new Error('API error')
            mockClient.getUserLastTweets.mockRejectedValueOnce(error)

            await expect(endpoint.fetch({
                userName: 'testuser'
            })).rejects.toThrow('API error')
        })
    })

    describe('TweetRepliesEndpoint', () => {
        let endpoint: TweetRepliesEndpoint

        beforeEach(() => {
            endpoint = new TweetRepliesEndpoint(mockClient as any)
        })

        it('should fetch tweet replies successfully', async () => {
            const mockTweet = createMockApiTweet({ id: '789', text: 'Test reply' })
            const mockResponse = createMockTweetsApiResponse({
                tweets: [mockTweet],
                has_next_page: false,
                next_cursor: null
            })

            mockClient.getTweetReplies.mockResolvedValueOnce(mockResponse)

            const result = await endpoint.fetch({
                tweetId: '1234567890'
            }, 'cursor-789')

            expect(mockClient.getTweetReplies).toHaveBeenCalledWith('1234567890', 'cursor-789')

            expect(result).toEqual({
                tweets: [mockTweet],
                hasNextPage: false,
                nextCursor: null
            })
        })

        it('should handle fetch without cursor', async () => {
            const mockResponse = createMockTweetsApiResponse()
            mockClient.getTweetReplies.mockResolvedValueOnce(mockResponse)

            const result = await endpoint.fetch({
                tweetId: '1234567890'
            })

            expect(mockClient.getTweetReplies).toHaveBeenCalledWith('1234567890', undefined)

            expect(result).toEqual({
                tweets: mockResponse.tweets,
                hasNextPage: mockResponse.has_next_page,
                nextCursor: mockResponse.next_cursor
            })
        })

        it('should propagate client errors', async () => {
            const error = new Error('API error')
            mockClient.getTweetReplies.mockRejectedValueOnce(error)

            await expect(endpoint.fetch({
                tweetId: '1234567890'
            })).rejects.toThrow('API error')
        })
    })
})
