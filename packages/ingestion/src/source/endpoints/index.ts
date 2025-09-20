import { ApiTweet } from '../';

export * from './UserMentionsEndpoint';
export * from './UserLastTweetsEndpoint';
export * from './TweetRepliesEndpoint';

export interface TwitterEndpoint {
    fetch(params: any, cursor?: string): Promise<{
        tweets: ApiTweet[];
        hasNextPage: boolean;
        nextCursor?: string | null;
    }>;
}