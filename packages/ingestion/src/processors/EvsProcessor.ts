import { TweetProcessor, ProcessorResult, TweetData } from '../pipeline/types';

export class EvsProcessor implements TweetProcessor {
  name = 'EvsProcessor';

  async process(tweets: TweetData[]): Promise<ProcessorResult> {
    // EVS calculation is already done in transformer
    // This processor could do additional EVS-related processing
    // like updating analytics tables, computing trends, etc.
    
    const tweetsWithEvs = tweets.filter(t => t.evs !== undefined && t.evs !== null);
    
    return {
      success: true,
      processed: tweetsWithEvs.length,
      message: `EVS scores calculated for ${tweetsWithEvs.length} tweets`
    };
  }
}
