import { TwitterPipeline } from './tweets-pipeline';
import { 
  TwitterClient,
  AdvancedSearchEndpoint, 
  UserMentionsEndpoint, 
  UserLastTweetsEndpoint, 
  TweetRepliesEndpoint, 
  TwitterEndpointEnum 
} from '../sources';
import { AnalyticsProcessor, TweetProcessor } from '../processors';
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

// Universal Twitter scraper pipeline builder
export function createTwitterScraperPipeline(config: {
  endpoint: TwitterEndpointEnum;
}): TwitterPipeline {
  const client = TwitterClient.getInstance();
  
  let endpointInstance;
  switch (config.endpoint) {
    case TwitterEndpointEnum.USER_MENTIONS:
      endpointInstance = new UserMentionsEndpoint(client);
      break;
    case TwitterEndpointEnum.USER_LAST_TWEETS:
      endpointInstance = new UserLastTweetsEndpoint(client);
      break;
    case TwitterEndpointEnum.TWEET_REPLIES:
      endpointInstance = new TweetRepliesEndpoint(client);
      break;
    case TwitterEndpointEnum.ADVANCED_SEARCH:
      endpointInstance = new AdvancedSearchEndpoint(client);
      break;
    default:
      throw new Error(`Unsupported endpoint: ${config.endpoint}`);
  }
  
  const processors: TweetProcessor[] = [new AnalyticsProcessor()];
  
  return new TwitterPipeline({
    source: endpointInstance,
    transformer: new TweetTransformer(),
    sink: new TweetSink(),
    processors
  });
}


// Re-export TwitterClient static methods for testing
export const resetTwitterClient = TwitterClient.resetInstance;
