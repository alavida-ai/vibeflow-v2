// Move the existing TwitterClient from packages/ingestion/src/client/twitter.ts
// This is the same code - just moved to endpoints folder

import { z } from "zod";
import type { 
  UserMentionsParams, 
  AdvancedSearchParams, 
  TweetRepliesParams, 
  UserLastTweetsParams
} from './params';

/* -------------------------------------------------------------------------- */
/*                              TYPES                                     */
/* -------------------------------------------------------------------------- */

export const apiTweetAuthorSchema = z.object({
  type: z.literal("user"),
  userName: z.string(),
  url: z.string(),
  twitterUrl: z.string(),
  id: z.string(),
  name: z.string(),
  isVerified: z.boolean(),
  isBlueVerified: z.boolean(),
  verifiedType: z.string().nullable(),
  profilePicture: z.string(),
  coverPicture: z.string().optional(),
  description: z.string(),
  location: z.string(),
  followers: z.number(),
  following: z.number(),
  status: z.string(),
  canDm: z.boolean(),
  canMediaTag: z.boolean(),
  createdAt: z.string(),
  entities: z.object({
    description: z.object({
      urls: z.array(z.unknown())
    })
  }),
}).passthrough();

export const apiTweetMediaSchema = z.object({
  type: z.string(),
  media_url_https: z.string(),
  video_info: z.object({
    variants: z.array(z.object({
      url: z.string(),
      content_type: z.string(),
      bitrate: z.number().optional() // ← FIXED: bitrate is optional for some video formats
    }))
  }).optional()
});

export const apiTweetSchema = z.object({
  type: z.literal("tweet"),
  id: z.string(),
  url: z.string(),
  twitterUrl: z.string(),
  text: z.string(),
  source: z.string(),
  retweetCount: z.number(),
  replyCount: z.number(),
  likeCount: z.number(),
  quoteCount: z.number(),
  viewCount: z.number(),
  createdAt: z.string(),
  lang: z.string(),
  bookmarkCount: z.number(),
  isReply: z.boolean(),
  inReplyToId: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  displayTextRange: z.tuple([z.number(), z.number()]),
  inReplyToUserId: z.string().optional().nullable(),
  inReplyToUsername: z.string().optional().nullable(),
  author: apiTweetAuthorSchema,
  extendedEntities: z.object({
    media: z.array(apiTweetMediaSchema).optional()
  })
}).passthrough();

export const userLastTweetsApiResponseSchema = z.object({
  data: z.object({
    tweets: z.array(apiTweetSchema)
  }),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional().nullable(),
  status: z.string(),
  msg: z.string(),
});

export const apiTweetsResponseSchema = z.object({
  tweets: z.array(apiTweetSchema),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional().nullable(),
  status: z.string(),
  msg: z.string(),
});

export type ApiTweetAuthor = z.infer<typeof apiTweetAuthorSchema>;
export type ApiTweet = z.infer<typeof apiTweetSchema>;
export type TweetsApiResponse = z.infer<typeof apiTweetsResponseSchema>;
export type UserLastTweetsApiResponse = z.infer<typeof userLastTweetsApiResponseSchema>;

/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

export const TWITTER_API_BASE_URL = 'https://api.twitterapi.io';
export const USER_MENTIONS_ENDPOINT = '/twitter/user/mentions';
export const REPLIES_ENDPOINT = '/twitter/tweet/replies';
export const LAST_TWEETS_ENDPOINT = '/twitter/user/last_tweets';
export const ADVANCED_SEARCH_ENDPOINT = '/twitter/tweet/advanced_search';

/* -------------------------------------------------------------------------- */
/*                              CLASS                                     */
/* -------------------------------------------------------------------------- */

export class TwitterClient {
  private readonly apiKey: string;
  private static _instance: TwitterClient | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Singleton pattern with lazy loading
  static getInstance(): TwitterClient {
    if (TwitterClient._instance === null) {
      if (!process.env.TWITTER_API_KEY) {
        throw new Error("TWITTER_API_KEY is not set");
      }
      TwitterClient._instance = new TwitterClient(process.env.TWITTER_API_KEY);
      console.log('📡 TwitterClient initialized');
    }
    return TwitterClient._instance;
  }

  // Reset singleton (useful for testing)
  static resetInstance(): void {
    TwitterClient._instance = null;
  }

  private async makeRequest(url: string): Promise<unknown> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', JSON.stringify(data, null, 2));
      throw new Error(`HTTP error! status: ${response.status}, data: ${JSON.stringify(data)}`);
    }

    return data;
  }

  /* -------------------------------------------------------------------------- */
  /*                              ENDPOINTS                                     */
  /* -------------------------------------------------------------------------- */


  async getUserMentions({ userName, sinceTime }: UserMentionsParams, cursor?: string): Promise<TweetsApiResponse> {
    try {

      const url = new URL(USER_MENTIONS_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('userName', userName);
      url.searchParams.set('sinceTime', Math.floor(sinceTime.getTime() / 1000).toString());

      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const rawData = await this.makeRequest(url.toString());

      const response = apiTweetsResponseSchema.parse(rawData);

      return response;
    } catch (error) {
      console.error('❌ Error in mentions:', error);
      throw error;
    }
  }

  async getTweetReplies({ tweetId }: TweetRepliesParams, cursor?: string): Promise<TweetsApiResponse> {
    try {
      const url = new URL(REPLIES_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('tweetId', tweetId);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }
      const rawData = await this.makeRequest(url.toString());
      const response = apiTweetsResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error('❌ Error in replies:', error);
      throw error;
    }
  }

  async getUserLastTweets({ userName }: UserLastTweetsParams, cursor?: string): Promise<UserLastTweetsApiResponse> {
    try {
      const url = new URL(LAST_TWEETS_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('userName', userName);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }
      const rawData = await this.makeRequest(url.toString());

      const response = userLastTweetsApiResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error('❌ Error in last tweets:', error);
      throw error;
    }
  }

  async getAdvancedSearch({ query, queryType }: AdvancedSearchParams, cursor?: string): Promise<TweetsApiResponse> {
    try {

      const url = new URL(ADVANCED_SEARCH_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('query', query);
      url.searchParams.set('queryType', queryType);

      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const rawData = await this.makeRequest(url.toString());

      const response = apiTweetsResponseSchema.parse(rawData);

      return response;
    } catch (error) {
      console.error('❌ Error in mentions:', error);
      throw error;
    }
  }
}
