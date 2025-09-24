import { TwitterClient } from '../client';
import { TwitterEndpoint } from '..';
import type { TweetRepliesParams } from '../params';

export class TweetRepliesEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: TweetRepliesParams, 
    cursor?: string
  ) {
    const response = await this.client.getTweetReplies(params, cursor);

    return {
      tweets: response.tweets,
      hasNextPage: response.has_next_page ?? false,
      nextCursor: response.next_cursor
    };
  }
}