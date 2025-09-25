import { TwitterEndpoint } from '..';
import { TwitterClient } from '../client';
import type { UserLastTweetsParams } from '../params';

export class UserLastTweetsEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: UserLastTweetsParams, 
    cursor?: string
  ) {
    const response = await this.client.getUserLastTweets(params, cursor);

    // Handle the "data" wrapper in LastTweetsApiResponse
    return {
      tweets: response.data.tweets,
      hasNextPage: response.has_next_page ?? false,
      nextCursor: response.next_cursor
    };
  }
}