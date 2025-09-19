import { TwitterEndpoint } from '../pipeline/types';
import { TwitterClient } from './TwitterClient';

export class RepliesEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: { tweetId: string }, 
    cursor?: string
  ) {
    const response = await this.client.getReplies(params.tweetId, cursor);

    return {
      tweets: response.tweets,
      hasNextPage: response.has_next_page,
      nextCursor: response.next_cursor
    };
  }
}