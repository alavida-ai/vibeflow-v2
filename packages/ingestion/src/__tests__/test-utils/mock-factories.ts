import { ApiTweet, ApiTweetAuthor, TweetsApiResponse, UserLastTweetsApiResponse } from '../../sources'
import { schema } from '@vibeflow/database'

export function createMockApiTweetAuthor(overrides: Partial<ApiTweetAuthor> = {}): ApiTweetAuthor {
  return {
    type: "user",
    userName: "testuser",
    url: "https://x.com/testuser",
    twitterUrl: "https://twitter.com/testuser", 
    id: "123456789",
    name: "Test User",
    isVerified: false,
    isBlueVerified: true,
    verifiedType: null,
    profilePicture: "https://pbs.twimg.com/profile_images/test.jpg",
    coverPicture: "https://pbs.twimg.com/profile_banners/test.jpg",
    description: "",
    location: "Test Location",
    followers: 100,
    following: 50,
    status: "",
    canDm: false,
    canMediaTag: false,
    createdAt: "Tue Jun 02 20:12:29 +0000 2009",
    entities: {
      description: { urls: [] }
    },
    fastFollowersCount: 0,
    favouritesCount: 100,
    hasCustomTimelines: true,
    isTranslator: false,
    mediaCount: 50,
    statusesCount: 200,
    withheldInCountries: [],
    affiliatesHighlightedLabel: {},
    possiblySensitive: false,
    pinnedTweetIds: [],
    profile_bio: {
      description: "Test bio description",
      entities: { 
        description: {}
      }
    },
    isAutomated: false,
    automatedBy: null,
    ...overrides
  }
}

export function createMockApiTweet(overrides: Partial<ApiTweet> = {}): ApiTweet {
  const baseAuthor = createMockApiTweetAuthor()
  const baseExtendedEntities = { media: [] }
  
  return {
    type: "tweet",
    id: "1234567890",
    url: "https://x.com/testuser/status/1234567890",
    twitterUrl: "https://twitter.com/testuser/status/1234567890",
    text: "This is a test tweet",
    source: "Twitter for iPhone",
    retweetCount: 5,
    replyCount: 2,
    likeCount: 10,
    quoteCount: 1,
    viewCount: 100,
    createdAt: "Sun Sep 21 11:37:36 +0000 2025",
    lang: "en",
    bookmarkCount: 3,
    isReply: false,
    inReplyToId: null,
    conversationId: "1234567890",
    displayTextRange: [0, 20] as [number, number],
    inReplyToUserId: null,
    inReplyToUsername: null,
    author: overrides.author ? { ...baseAuthor, ...overrides.author } : baseAuthor,
    extendedEntities: overrides.extendedEntities ? { ...baseExtendedEntities, ...overrides.extendedEntities } : baseExtendedEntities,
    card: null,
    place: {},
    entities: {},
    quoted_tweet: null,
    retweeted_tweet: null,
    isLimitedReply: false,
    article: null,
    ...overrides
  }
}

export function createMockTweetsApiResponse(overrides: Partial<TweetsApiResponse> = {}): TweetsApiResponse {
  return {
    tweets: [createMockApiTweet()],
    has_next_page: false,
    next_cursor: null,
    status: "success",
    msg: "Success",
    ...overrides
  }
}

export function createMockUserLastTweetsApiResponse(overrides: Partial<UserLastTweetsApiResponse> = {}): UserLastTweetsApiResponse {
  return {
    data: {
      tweets: [createMockApiTweet()]
    },
    has_next_page: false,
    next_cursor: null,
    status: "success",
    msg: "Success",
    ...overrides
  }
}

export function createMockTweetWithMedia(overrides: Partial<schema.TweetWithMedia> = {}): schema.TweetWithMedia {
  return {
    id: 1,
    apiId: "1234567890",
    text: "This is a test tweet",
    language: "en",
    url: "https://x.com/testuser/status/1234567890",
    authorId: "123456789",
    authorUsername: "testuser",
    authorName: "Test User",
    authorFollowers: 100,
    conversationId: "1234567890",
    isReply: false,
    inReplyToId: null,
    inReplyToUsername: null,
    likeCount: 10,
    replyCount: 2,
    retweetCount: 5,
    quoteCount: 1,
    viewCount: 100,
    bookmarkCount: 3,
    createdAtUtc: new Date("2024-01-01T12:00:00.000Z"),
    capturedAtUtc: new Date("2024-01-01T12:00:00.000Z"),
    updatedAtUtc: new Date("2024-01-01T12:00:00.000Z"),
    source: "user-mentions",
    rawJson: createMockApiTweet(),
    media: [],
    ...overrides
  }
}

// Helper to create a tweet with video media (like the real API)
export function createMockApiTweetWithVideo(overrides: Partial<ApiTweet> = {}): ApiTweet {
  return createMockApiTweet({
    extendedEntities: {
      media: [{
        type: "video",
        media_url_https: "https://pbs.twimg.com/ext_tw_video_thumb/test.jpg",
        video_info: {
          variants: [
            {
              url: "https://video.twimg.com/ext_tw_video/test/pu/vid/avc1/320x568/test.mp4?tag=12",
              content_type: "video/mp4",
              bitrate: 632000
            },
            {
              url: "https://video.twimg.com/ext_tw_video/test/pu/vid/avc1/480x852/test.mp4?tag=12",
              content_type: "video/mp4",
              bitrate: 950000
            },
            {
              url: "https://video.twimg.com/ext_tw_video/test/pu/vid/avc1/720x1280/test.mp4?tag=12",
              content_type: "video/mp4",
              bitrate: 2176000
            },
            {
              url: "https://video.twimg.com/ext_tw_video/test/pu/pl/test.m3u8?tag=12&v=e8d",
              content_type: "application/x-mpegURL"
              // Note: no bitrate for HLS streams - this tests our optional bitrate fix
            }
          ]
        }
      }]
    },
    ...overrides
  })
}

// Helper to create a tweet with "photo" media type (like the real API issue)
export function createMockApiTweetWithPhoto(overrides: Partial<ApiTweet> = {}): ApiTweet {
  return createMockApiTweet({
    extendedEntities: {
      media: [{
        type: "photo", // This is what's causing the enum error
        media_url_https: "https://pbs.twimg.com/media/test.jpg"
      }]
    },
    ...overrides
  })
}
