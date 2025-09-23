export * from './user-mentions';
export * from './user-last-tweets';
export * from './tweet-replies';
export * from './advanced-search';

// define endpoitns enum here
export enum TwitterEndpointEnum {
  USER_MENTIONS = 'userMentions',
  USER_LAST_TWEETS = 'userLastTweets',
  TWEET_REPLIES = 'tweetReplies',
  ADVANCED_SEARCH = 'advancedSearch',
}

/**
 * Type alias for better readability in function signatures
 */
export type TwitterEndpointType = TwitterEndpointEnum;