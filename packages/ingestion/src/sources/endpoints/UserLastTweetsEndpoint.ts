import { TwitterEndpoint } from '.';
import { TwitterClient } from '../TwitterClient';

export class UserLastTweetsEndpoint implements TwitterEndpoint {
  constructor(private client: TwitterClient) {}

  async fetch(
    params: { userName: string }, 
    cursor?: string
  ) {
    const response = await this.client.getUserLastTweets(params.userName, cursor);

    // Handle the "data" wrapper in LastTweetsApiResponse
    return {
      tweets: response.data.tweets,
      hasNextPage: response.has_next_page,
      nextCursor: response.next_cursor
    };
  }
}