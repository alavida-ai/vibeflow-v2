import { vi } from 'vitest'
import { TwitterClient, TweetsApiResponse, UserLastTweetsApiResponse } from '../../sources'
import { createMockTweetsApiResponse, createMockUserLastTweetsApiResponse } from './mock-factories'

export class MockTwitterClient {
    private static _instance: MockTwitterClient | null = null

    static getInstance(): MockTwitterClient {
        if (!MockTwitterClient._instance) {
            MockTwitterClient._instance = new MockTwitterClient()
        }
        return MockTwitterClient._instance
    }

    static resetInstance(): void {
        MockTwitterClient._instance = null
    }

    getUserMentions = vi.fn()
        .mockResolvedValue(createMockTweetsApiResponse())

    getTweetReplies = vi.fn()
        .mockResolvedValue(createMockTweetsApiResponse())

    getUserLastTweets = vi.fn()
        .mockResolvedValue(createMockUserLastTweetsApiResponse())
}

export function mockTwitterClient() {
    const mockClient = MockTwitterClient.getInstance()

    vi.spyOn(TwitterClient, 'getInstance').mockReturnValue(mockClient as any)
    vi.spyOn(TwitterClient, 'resetInstance').mockImplementation(MockTwitterClient.resetInstance)

    return mockClient
}
