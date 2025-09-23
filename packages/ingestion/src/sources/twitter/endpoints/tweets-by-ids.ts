import { TwitterClient } from '../client';
import { TwitterEndpoint } from '..';
import type { TweetsByIdsParams } from '../params';

export class TweetsByIdsEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: TweetsByIdsParams, 
    cursor?: string
  ) {
    const response = await this.client.getTweetsByIds(params, cursor);

    return {
      tweets: response.tweets,
      hasNextPage: response.has_next_page,
      nextCursor: response.next_cursor
    };
  }
}