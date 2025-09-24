import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TwitterClient } from '../../sources/twitter-client'
import { createMockTweetsApiResponse, createMockUserLastTweetsApiResponse, createMockApiTweet } from '../test-utils'

// Mock fetch globally
global.fetch = vi.fn()

describe('TwitterClient', () => {
    beforeEach(() => {
        // Reset environment and singleton
        vi.unstubAllEnvs()
        TwitterClient.resetInstance()
        vi.clearAllMocks()
    })

    afterEach(() => {
        TwitterClient.resetInstance()
    })

    describe('getInstance', () => {
        it('should create singleton instance with API key from environment', () => {
            vi.stubEnv('TWITTER_API_KEY', 'test-api-key')

            const client1 = TwitterClient.getInstance()
            const client2 = TwitterClient.getInstance()

            expect(client1).toBe(client2)
            expect(client1).toBeInstanceOf(TwitterClient)
        })

        it('should throw error when TWITTER_API_KEY is not set', () => {
            vi.stubEnv('TWITTER_API_KEY', '')

            expect(() => TwitterClient.getInstance()).toThrow('TWITTER_API_KEY is not set')
        })
    })

    describe('getUserMentions', () => {
        beforeEach(() => {
            vi.stubEnv('TWITTER_API_KEY', 'test-api-key')
        })

        it('should fetch user mentions successfully', async () => {
            const mockTweet = createMockApiTweet({ 
                id: '123', 
                text: 'Test mention'
            })
            const mockResponse = createMockTweetsApiResponse({
                tweets: [mockTweet]
            })

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response)

            const client = TwitterClient.getInstance()
            const result = await client.getUserMentions({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01'),
                cursor: 'test-cursor'
            })

            expect(fetch).toHaveBeenCalledWith(
                'https://api.twitterapi.io/twitter/user/mentions?userName=testuser&sinceTime=1704067200&cursor=test-cursor',
                {
                    method: 'GET',
                    headers: {
                        'X-API-Key': 'test-api-key',
                        'Accept': 'application/json'
                    }
                }
            )
            expect(result).toEqual(mockResponse)
        })

        it('should fetch user mentions without cursor', async () => {
            const mockResponse = createMockTweetsApiResponse()

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response)

            const client = TwitterClient.getInstance()
            await client.getUserMentions({
                userName: 'testuser',
                sinceTime: new Date('2024-01-01')
            })

            expect(fetch).toHaveBeenCalledWith(
                'https://api.twitterapi.io/twitter/user/mentions?userName=testuser&sinceTime=1704067200',
                expect.any(Object)
            )
        })

        it('should handle API errors', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Bad request' })
            } as Response)

            const client = TwitterClient.getInstance()

            await expect(
                client.getUserMentions({
                    userName: 'testuser',
                    sinceTime: new Date('2024-01-01')
                })
            ).rejects.toThrow('HTTP error! status: 400')
        })
    })

    describe('getTweetReplies', () => {
        beforeEach(() => {
            vi.stubEnv('TWITTER_API_KEY', 'test-api-key')
        })

        it('should fetch tweet replies successfully', async () => {
            const mockResponse = createMockTweetsApiResponse()

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response)

            const client = TwitterClient.getInstance()
            const result = await client.getTweetReplies('1234567890', 'test-cursor')

            expect(fetch).toHaveBeenCalledWith(
                'https://api.twitterapi.io/twitter/tweet/replies?tweetId=1234567890&cursor=test-cursor',
                {
                    method: 'GET',
                    headers: {
                        'X-API-Key': 'test-api-key',
                        'Accept': 'application/json'
                    }
                }
            )
            expect(result).toEqual(mockResponse)
        })

        it('should fetch tweet replies without cursor', async () => {
            const mockResponse = createMockTweetsApiResponse()

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response)

            const client = TwitterClient.getInstance()
            await client.getTweetReplies('1234567890')

            expect(fetch).toHaveBeenCalledWith(
                'https://api.twitterapi.io/twitter/tweet/replies?tweetId=1234567890',
                expect.any(Object)
            )
        })
    })

    describe('getUserLastTweets', () => {
        beforeEach(() => {
            vi.stubEnv('TWITTER_API_KEY', 'test-api-key')
        })

        it('should fetch user last tweets successfully', async () => {
            const mockResponse = createMockUserLastTweetsApiResponse()

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response)

            const client = TwitterClient.getInstance()
            const result = await client.getUserLastTweets('testuser', 'test-cursor')

            expect(fetch).toHaveBeenCalledWith(
                'https://api.twitterapi.io/twitter/user/last_tweets?userName=testuser&cursor=test-cursor',
                {
                    method: 'GET',
                    headers: {
                        'X-API-Key': 'test-api-key',
                        'Accept': 'application/json'
                    }
                }
            )
            expect(result).toEqual(mockResponse)
        })

        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

            const client = TwitterClient.getInstance()

            await expect(
                client.getUserLastTweets('testuser')
            ).rejects.toThrow('Network error')
        })
    })
})
