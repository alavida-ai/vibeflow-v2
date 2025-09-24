export * from './user-mentions';
export * from './user-last-tweets';
export * from './tweet-replies';
export * from './advanced-search';
export * from './tweets-by-ids';

// define endpoitns enum here
export enum TwitterEndpointEnum {
  USER_MENTIONS = 'userMentions',
  USER_LAST_TWEETS = 'userLastTweets',
  TWEET_REPLIES = 'tweetReplies',
  ADVANCED_SEARCH = 'advancedSearch',
  TWEETS_BY_IDS = 'tweetsByIds',
}

/**
 * Type alias for better readability in function signatures
 */
export type TwitterEndpointType = TwitterEndpointEnum;