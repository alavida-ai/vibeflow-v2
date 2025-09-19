import { TwitterPipeline } from './pipeline/tweets-pipeline';
import { TwitterClient, UserMentionsEndpoint, UserLastTweetsEndpoint, TweetRepliesEndpoint } from './source';
import { MediaProcessor } from './processors';

export function createMentionsPipeline(apiKey: string): TwitterPipeline {
  const client = new TwitterClient(apiKey);
  
  return new TwitterPipeline({
    endpoint: new UserMentionsEndpoint(client),
    processors: []
  });
}

export function createUserTweetsPipeline(apiKey: string): TwitterPipeline {
  const client = new TwitterClient(apiKey);
  
  return new TwitterPipeline({
    endpoint: new UserLastTweetsEndpoint(client),
    processors: [
      new MediaProcessor()
    ]
  });
}

export function createRepliesPipeline(apiKey: string): TwitterPipeline {
  const client = new TwitterClient(apiKey);
  
  return new TwitterPipeline({
    endpoint: new TweetRepliesEndpoint(client),
    processors: []
  });
}

// Custom pipeline builder
export function createCustomPipeline(config: {
  apiKey: string;
  endpoint: 'mentions' | 'userTweets' | 'replies';
  storage: 'listener' | 'analyzer';
  includeMediaProcessing?: boolean;
  includeEvs?: boolean;
}): TwitterPipeline {
  const client = new TwitterClient(config.apiKey);
  
  let endpoint;
  switch (config.endpoint) {
    case 'mentions':
      endpoint = new UserMentionsEndpoint(client);
      break;
    case 'userTweets':
      endpoint = new UserLastTweetsEndpoint(client);
      break;
    case 'replies':
      endpoint = new TweetRepliesEndpoint(client);
      break;
  }
  
  const processors = [];
  if (config.includeEvs) {
    // processors.push(new EvsProcessor());
  }
  if (config.includeMediaProcessing) {
    processors.push(new MediaProcessor());
  }
  
  return new TwitterPipeline({
    endpoint,
    processors
  });
}
