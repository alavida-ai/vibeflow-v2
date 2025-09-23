import { TwitterEndpoint } from '..';
import { TwitterClient } from '../client';
import type { AdvancedSearchParams } from '../params';

export class AdvancedSearchEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: AdvancedSearchParams, 
    cursor?: string
  ) {
    const response = await this.client.getAdvancedSearch(params, cursor);

    return {
      tweets: response.tweets,
      hasNextPage: response.has_next_page,
      nextCursor: response.next_cursor
    };
  }
}