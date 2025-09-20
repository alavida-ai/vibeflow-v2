import { TwitterPipeline } from './tweets-pipeline';
import { TwitterClient, UserMentionsEndpoint, UserLastTweetsEndpoint, TweetRepliesEndpoint } from '../sources';
import { MediaProcessor } from '../processors';
import { TweetTransformer } from '../transformers';
import { TweetSink } from '../sinks';


export function createMentionsPipeline(): TwitterPipeline {
  const client = TwitterClient.getInstance();
  
  return new TwitterPipeline({
    source: new UserMentionsEndpoint(client),
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors: []
  });
}

export function createUserLastTweetsPipeline(): TwitterPipeline {
  const client = TwitterClient.getInstance();
  
  return new TwitterPipeline({
    source: new UserLastTweetsEndpoint(client),
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors: []
  });
}

export function createRepliesPipeline(): TwitterPipeline {
  const client = TwitterClient.getInstance();
  
  return new TwitterPipeline({
    source: new TweetRepliesEndpoint(client),
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors: []
  });
}

// Custom pipeline builder
export function createCustomPipeline(config: {
  endpoint: 'mentions' | 'userTweets' | 'replies';
  storage: 'listener' | 'analyzer';
  includeMediaProcessing?: boolean;
  includeEvs?: boolean;
}): TwitterPipeline {
  const client = TwitterClient.getInstance();
  
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
    source: endpoint,
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors
  });
}

// Re-export TwitterClient static methods for testing
export const resetTwitterClient = TwitterClient.resetInstance;
