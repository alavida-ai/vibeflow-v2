import { TwitterEndpoint } from '.';
import { TwitterClient } from '../twitter-client';

export class UserMentionsEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: { userName: string; sinceTime: Date }, 
    cursor?: string
  ) {
    const response = await this.client.getUserMentions({
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
