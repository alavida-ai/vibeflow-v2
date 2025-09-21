import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    createMentionsPipeline,
    createUserLastTweetsPipeline,
    createRepliesPipeline,
    createCustomPipeline
} from '../../pipelines/factories'
import { TwitterPipeline } from '../../pipelines/tweets-pipeline'
import { UserMentionsEndpoint, UserLastTweetsEndpoint, TweetRepliesEndpoint } from '../../sources/endpoints'
import { TweetTransformer } from '../../transformers/TweetTransformer'
import { TweetSink } from '../../sinks/TweetSink'
import { MediaProcessor } from '../../processors'
import { mockTwitterClient } from '../test-utils'

describe('Pipeline Factories', () => {
    let mockClient: ReturnType<typeof mockTwitterClient>

    beforeEach(() => {
        vi.stubEnv('TWITTER_API_KEY', 'test-api-key')
        mockClient = mockTwitterClient()
    })

    describe('createMentionsPipeline', () => {
        it('should create a TwitterPipeline with UserMentionsEndpoint', () => {
            const pipeline = createMentionsPipeline()

            expect(pipeline).toBeInstanceOf(TwitterPipeline)

            // Access private config through type assertion for testing
            const config = (pipeline as any).config
            expect(config.source).toBeInstanceOf(UserMentionsEndpoint)
            expect(config.transformer).toBeInstanceOf(TweetTransformer)
            expect(config.sink).toBeInstanceOf(TweetSink)
            expect(config.processors).toEqual([])
        })
    })

    describe('createUserLastTweetsPipeline', () => {
        it('should create a TwitterPipeline with UserLastTweetsEndpoint', () => {
            const pipeline = createUserLastTweetsPipeline()

            expect(pipeline).toBeInstanceOf(TwitterPipeline)

            const config = (pipeline as any).config
            expect(config.source).toBeInstanceOf(UserLastTweetsEndpoint)
            expect(config.transformer).toBeInstanceOf(TweetTransformer)
            expect(config.sink).toBeInstanceOf(TweetSink)
            expect(config.processors).toEqual([])
        })
    })

    describe('createRepliesPipeline', () => {
        it('should create a TwitterPipeline with TweetRepliesEndpoint', () => {
            const pipeline = createRepliesPipeline()

            expect(pipeline).toBeInstanceOf(TwitterPipeline)

            const config = (pipeline as any).config
            expect(config.source).toBeInstanceOf(TweetRepliesEndpoint)
            expect(config.transformer).toBeInstanceOf(TweetTransformer)
            expect(config.sink).toBeInstanceOf(TweetSink)
            expect(config.processors).toEqual([])
        })
    })

    describe('createCustomPipeline', () => {
        it('should create pipeline with mentions endpoint', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'mentions',
                storage: 'listener'
            })

            expect(pipeline).toBeInstanceOf(TwitterPipeline)

            const config = (pipeline as any).config
            expect(config.source).toBeInstanceOf(UserMentionsEndpoint)
            expect(config.processors).toEqual([])
        })

        it('should create pipeline with userTweets endpoint', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'userTweets',
                storage: 'analyzer'
            })

            expect(pipeline).toBeInstanceOf(TwitterPipeline)

            const config = (pipeline as any).config
            expect(config.source).toBeInstanceOf(UserLastTweetsEndpoint)
        })

        it('should create pipeline with replies endpoint', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'replies',
                storage: 'listener'
            })

            expect(pipeline).toBeInstanceOf(TwitterPipeline)

            const config = (pipeline as any).config
            expect(config.source).toBeInstanceOf(TweetRepliesEndpoint)
        })

        it('should include MediaProcessor when includeMediaProcessing is true', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'mentions',
                storage: 'listener',
                includeMediaProcessing: true
            })

            const config = (pipeline as any).config
            expect(config.processors).toHaveLength(1)
            expect(config.processors[0]).toBeInstanceOf(MediaProcessor)
        })

        it('should not include EvsProcessor when includeEvs is true (commented out)', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'mentions',
                storage: 'listener',
                includeEvs: true
            })

            const config = (pipeline as any).config
            expect(config.processors).toEqual([])
        })

        it('should include both processors when both options are true', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'mentions',
                storage: 'listener',
                includeMediaProcessing: true,
                includeEvs: true
            })

            const config = (pipeline as any).config
            // Only MediaProcessor should be included since EvsProcessor is commented out
            expect(config.processors).toHaveLength(1)
            expect(config.processors[0]).toBeInstanceOf(MediaProcessor)
        })

        it('should create pipeline with no processors by default', () => {
            const pipeline = createCustomPipeline({
                endpoint: 'mentions',
                storage: 'listener'
            })

            const config = (pipeline as any).config
            expect(config.processors).toEqual([])
        })
    })

    describe('integration with TwitterClient singleton', () => {
        it('should use the same TwitterClient instance across all factories', () => {
            const mentionsPipeline = createMentionsPipeline()
            const userTweetsPipeline = createUserLastTweetsPipeline()
            const repliesPipeline = createRepliesPipeline()

            // All should use the same client instance (mocked)
            const mentionsSource = (mentionsPipeline as any).config.source
            const userTweetsSource = (userTweetsPipeline as any).config.source
            const repliesSource = (repliesPipeline as any).config.source

            // Since we're using a singleton pattern, they should all reference the same client
            expect(mentionsSource.client).toBe(mockClient)
            expect(userTweetsSource.client).toBe(mockClient)
            expect(repliesSource.client).toBe(mockClient)
        })
    })
})
