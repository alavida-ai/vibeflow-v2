import { TwitterClient, TwitterApiResponse } from "./client/twitter";
import * as TwitterTransformer from "./transformer";
import { schema } from "@brand-listener/database";
import * as AnalyticsService from "@brand-listener/core/services/analytics";
import * as TwitterDatabaseService from "@brand-listener/core/services/database";

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

export interface BrandListenerConfig {
    userName: string;
    sinceTime: Date;
    maxPages?: number;
    cursor?: string;
  }
  
  export interface IngestionResult {
    success: boolean;
    totalTweets: number;
    pagesProcessed: number;
    nextCursor?: string;
    hasMorePages: boolean;
    error?: string;
  }

  export type PaginatedFetchFunction = (cursor?: string) => Promise<TwitterApiResponse>;
  export type ProcessPageFunction = (tweets: schema.InsertTweet[], pageInfo: { pageCount: number; hasNextPage: boolean }) => Promise<number>;
  
  /* -------------------------------------------------------------------------- */
  /*                              FUNCTIONS                                     */
  /* -------------------------------------------------------------------------- */

  /**
   * Generic pagination handler for Twitter API responses
   * Separates cursor management from data processing
   */
  async function handlePagination({
    fetchFunction,
    processPageFunction,
    maxPages = 100,
    initialCursor,
    operationName
  }: {
    fetchFunction: PaginatedFetchFunction;
    processPageFunction: ProcessPageFunction;
    maxPages?: number;
    initialCursor?: string;
    operationName: string;
  }): Promise<IngestionResult> {
    try {
      let cursor: string | undefined = initialCursor;
      let hasNextPage = true;
      let pageCount = 0;
      let totalTweets = 0;

      console.log(`🚀 Starting ${operationName}`);

      while (hasNextPage && pageCount < maxPages) {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}${cursor ? ` with cursor: ${cursor}` : ''}`);
        
        const response = await fetchFunction(cursor);
        const transformed = TwitterTransformer.transformTwitterResponse(response);

        if (transformed.tweets.length > 0) {
          const processedCount = await processPageFunction(transformed.tweets, { 
            pageCount, 
            hasNextPage: transformed.hasNextPage 
          });
          totalTweets += processedCount;
        } else {
          console.log("No tweets found for this page");
          break;
        }
        
        // Update pagination state
        hasNextPage = transformed.hasNextPage;
        cursor = transformed.nextCursor || undefined;
        
        console.log(`✅ Page ${pageCount}: Found ${transformed.tweets.length} tweets, hasNextPage: ${hasNextPage}`);
      }

      const reachedMaxPages = pageCount >= maxPages;
      if (reachedMaxPages) {
        console.log(`⚠️  Reached maximum page limit (${maxPages}). There may be more tweets available.`);
      }
      
      console.log(`🎉 Complete! Processed ${totalTweets} total tweets across ${pageCount} pages`);

      return {
        success: true,
        totalTweets,
        pagesProcessed: pageCount,
        nextCursor: cursor,
        hasMorePages: reachedMaxPages && hasNextPage
      };

    } catch (error) {
      console.error(`❌ ${operationName} failed:`, error);
      return {
        success: false,
        totalTweets: 0,
        pagesProcessed: 0,
        hasMorePages: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

export async function hasUserRepliedToTweet({
    tweetId,
    maxPages = 100,
    cursor: initialCursor
  }: {
    tweetId: string;
    maxPages?: number;
    cursor?: string;
  }): Promise<boolean> {
    if (!process.env.TWITTER_API_KEY) {
      throw new Error("TWITTER_API_KEY is not set");
    }
    const client = new TwitterClient(process.env.TWITTER_API_KEY);

    try {
      let currentCursor: string | undefined = initialCursor;
      let hasNextPage = true;
      let pageCount = 0;

      console.log(`🔍 Checking if user replied to tweet ${tweetId}`);

      while (hasNextPage && pageCount < maxPages) {
        pageCount++;
        console.log(`📄 Checking page ${pageCount}${currentCursor ? ` with cursor: ${currentCursor}` : ''}`);
        
        const response = await client.getReplies(tweetId, currentCursor);
        const transformed = TwitterTransformer.transformTwitterResponse(response);

        // Process tweets synchronously to allow early exit
        for (const tweet of transformed.tweets) {
          const isUserReply = await AnalyticsService.checkIfUserRepliedToTweet(tweet);
          if (isUserReply) {
            console.log(`✅ Found user reply on page ${pageCount}`);
            return true;
          }
        }
        
        // Update pagination state
        hasNextPage = transformed.hasNextPage;
        currentCursor = transformed.nextCursor || undefined;
        
        console.log(`📊 Page ${pageCount}: Checked ${transformed.tweets.length} replies, no user reply found`);
        
        if (transformed.tweets.length === 0) {
          break;
        }
      }

      console.log(`🔍 Completed search across ${pageCount} pages - no user reply found`);
      return false;

    } catch (error) {
      console.error(`❌ Error checking user replies for tweet ${tweetId}:`, error);
      throw error;
    }
  }

export async function batchCheckIfUserRepliedToTweet(tweetIds: string[]) : Promise<boolean[]> {
    return Promise.all(tweetIds.map(tweetId => checkIfUserRepliedToTweet(tweetId)));
  }

  /**
   * Batch check that returns only the tweet IDs that have NOT been replied to
   */
export async function batchFilterNonRespondedTweets(tweetIds: string[]): Promise<string[]> {
    const results = await Promise.all(
      tweetIds.map(async (tweetId) => ({
        tweetId,
        hasReply: await checkIfUserRepliedToTweet(tweetId)
      }))
    );
    
    return results
      .filter(result => !result.hasReply)
      .map(result => result.tweetId);
  }

  /**
   * Batch check that returns comprehensive response status information
   */
export async function batchCheckResponseStatus(tweets: TwitterDatabaseService.TweetCandidate[]): Promise<{
    respondedTweets: string[];
    nonRespondedTweets: string[];
    totalChecked: number;
    responseRate: number;
  }> {
    const results = await Promise.all(
      tweets.map(async (tweetCandidate) => ({
        tweetId: tweetCandidate.tweet.tweetId,
        hasReply: await checkIfUserRepliedToTweet(tweetCandidate.tweet.tweetId)
      }))
    );
    
    const respondedTweets = results
      .filter(result => result.hasReply)
      .map(result => result.tweetId);
      
    const nonRespondedTweets = results
      .filter(result => !result.hasReply)
      .map(result => result.tweetId);
    
    const responseRate = results.length > 0 ? (respondedTweets.length / results.length) * 100 : 0;
    
    return {
      respondedTweets,
      nonRespondedTweets,
      totalChecked: results.length,
      responseRate: Math.round(responseRate * 100) / 100 // Round to 2 decimal places
    };
  }

export async function checkIfUserRepliedToTweet(tweetId: string) : Promise<boolean> {
  try {
  const hasUserReplied = await hasUserRepliedToTweet({
      tweetId: tweetId
  });
  if (hasUserReplied) {
      await TwitterDatabaseService.setTweetStatus(tweetId, TwitterDatabaseService.REPLIED_TWEET_STATUS);
  }
  return hasUserReplied;
  } catch (error) {
    console.error(`❌ Error checking user replies for tweet ${tweetId}:`, error);
    throw error;
  }
}

export async function ingestMentions(config: BrandListenerConfig): Promise<IngestionResult> {
    const { 
      userName, 
      sinceTime, 
      maxPages = 100, 
      cursor: initialCursor 
    } = config;

    if (!process.env.TWITTER_API_KEY) {
      throw new Error("TWITTER_API_KEY is not set");
    }

    const client = new TwitterClient(process.env.TWITTER_API_KEY);
    
    const fetchFunction: PaginatedFetchFunction = (cursor?: string) => 
      client.mentions({ userName, sinceTime, cursor });

    const processPageFunction: ProcessPageFunction = async (tweets) => {
      const result = await TwitterDatabaseService.insertTweetsAndIgnoreDuplicates(tweets);
      console.log(`💾 Uploaded ${result.length} tweets`);
      return tweets.length;
    };

    return handlePagination({
      fetchFunction,
      processPageFunction,
      maxPages,
      initialCursor,
      operationName: `mention ingestion for @${userName} since ${sinceTime.toISOString()}`
    });
  }
