import { TwitterEndpoint } from '..';
import { TwitterClient } from '../client';
import type { UserMentionsParams } from '../params';

export class UserMentionsEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: UserMentionsParams, 
    cursor?: string
  ) {
    const response = await this.client.getUserMentions(params, cursor);

    return {
      tweets: response.tweets,
      hasNextPage: response.has_next_page ?? false,
      nextCursor: response.next_cursor
    };
  }
}