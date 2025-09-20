import { TwitterClient } from '../TwitterClient';
import { TwitterEndpoint } from '.';

export class TweetRepliesEndpoint implements TwitterEndpoint {
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