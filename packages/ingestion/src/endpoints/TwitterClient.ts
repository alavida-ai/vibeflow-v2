// Move the existing TwitterClient from packages/ingestion/src/client/twitter.ts
// This is the same code - just moved to endpoints folder

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                              TYPES                                     */
/* -------------------------------------------------------------------------- */

export const twitterAuthorSchema = z.object({
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

export const twitterTweetSchema = z.object({
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
  author: twitterAuthorSchema,
  extendedEntities: z.object({
    media: z.array(z.object({
      type: z.string(),
      media_url_https: z.string(),
      video_info: z.object({
        variants: z.array(z.object({
          url: z.string(),
          content_type: z.string()
        }))
      }).optional()
    })).optional()
  })
}).passthrough();

export const lastTweetsApiResponseSchema = z.object({
  data: z.object({
    tweets: z.array(twitterTweetSchema)
  }),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional().nullable(),
  status: z.string(),
  msg: z.string(),
});

export const twitterApiResponseSchema = z.object({
  tweets: z.array(twitterTweetSchema),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional().nullable(),
  status: z.string(),
  msg: z.string(),
});

export type TwitterApiAuthor = z.infer<typeof twitterAuthorSchema>;
export type TwitterApiTweet = z.infer<typeof twitterTweetSchema>;
export type TwitterApiResponse = z.infer<typeof twitterApiResponseSchema>;
export type LastTweetsApiResponse = z.infer<typeof lastTweetsApiResponseSchema>;

/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

export const TWITTER_API_BASE_URL = 'https://api.twitterapi.io';
export const USER_MENTIONS_ENDPOINT = '/twitter/user/mentions';
export const REPLIES_ENDPOINT = '/twitter/tweet/replies';
export const LAST_TWEETS_ENDPOINT = '/twitter/user/last_tweets';

/* -------------------------------------------------------------------------- */
/*                              CLASS                                     */
/* -------------------------------------------------------------------------- */

export class TwitterClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

  async mentions({
    userName,
    sinceTime,
    cursor
  }: {
    userName: string;
    sinceTime: Date;
    cursor?: string;
  }): Promise<TwitterApiResponse> {
    try {

      const url = new URL(USER_MENTIONS_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('userName', userName);
      url.searchParams.set('sinceTime', Math.floor(sinceTime.getTime() / 1000).toString());

      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const rawData = await this.makeRequest(url.toString());

      const response = twitterApiResponseSchema.parse(rawData);

      return response;
    } catch (error) {
      console.error('❌ Error in mentions:', error);
      throw error;
    }
  }

  async getReplies(tweetId: string, cursor?: string): Promise<TwitterApiResponse> {
    try {
      const url = new URL(REPLIES_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('tweetId', tweetId);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }
      const rawData = await this.makeRequest(url.toString());
      const response = twitterApiResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error('❌ Error in replies:', error);
      throw error;
    }
  }

  async getLastTweets(userName: string, cursor?: string): Promise<LastTweetsApiResponse> {
    try {
      const url = new URL(LAST_TWEETS_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set('userName', userName);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }
      const rawData = await this.makeRequest(url.toString());

      const response = lastTweetsApiResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error('❌ Error in last tweets:', error);
      throw error;
    }
  }
}
