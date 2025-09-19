import { TwitterEndpoint } from '../pipeline/types';
import { TwitterClient } from './TwitterClient';

export class MentionsEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: { userName: string; sinceTime: Date }, 
    cursor?: string
  ) {
    const response = await this.client.mentions({
      userName: params.userName,
      sinceTime: params.sinceTime,
      cursor
    });

    return {
      tweets: response.tweets,
      hasNextPage: response.has_next_page,
      nextCursor: response.next_cursor
    };
  }
}
