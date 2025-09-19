import { TwitterPipeline } from './pipeline/tweets-pipeline';
import { TwitterClient, MentionsEndpoint, UserTweetsEndpoint, RepliesEndpoint } from './source';
import { MediaProcessor, EvsProcessor } from './processors';

export function createMentionsPipeline(apiKey: string): TwitterPipeline {
  const client = new TwitterClient(apiKey);
  
  return new TwitterPipeline({
    endpoint: new MentionsEndpoint(client),
    storage: 'listener',
    processors: []
  });
}

export function createUserTweetsPipeline(apiKey: string): TwitterPipeline {
  const client = new TwitterClient(apiKey);
  
  return new TwitterPipeline({
    endpoint: new UserTweetsEndpoint(client),
    storage: 'analyzer',
    processors: [
      new EvsProcessor(),
      new MediaProcessor()
    ]
  });
}

export function createRepliesPipeline(apiKey: string): TwitterPipeline {
  const client = new TwitterClient(apiKey);
  
  return new TwitterPipeline({
    endpoint: new RepliesEndpoint(client),
    storage: 'listener',
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
      endpoint = new MentionsEndpoint(client);
      break;
    case 'userTweets':
      endpoint = new UserTweetsEndpoint(client);
      break;
    case 'replies':
      endpoint = new RepliesEndpoint(client);
      break;
  }
  
  const processors = [];
  if (config.includeEvs) {
    processors.push(new EvsProcessor());
  }
  if (config.includeMediaProcessing) {
    processors.push(new MediaProcessor());
  }
  
  return new TwitterPipeline({
    endpoint,
    storage: config.storage,
    processors
  });
}
