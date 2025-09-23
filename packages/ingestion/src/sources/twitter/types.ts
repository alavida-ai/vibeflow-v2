import { ApiTweet } from './client';

export interface TwitterEndpoint {
    fetch(params: any, cursor?: string): Promise<{
        tweets: ApiTweet[];
        hasNextPage: boolean;
        nextCursor?: string | null;
    }>;
}