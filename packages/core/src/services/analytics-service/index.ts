import { schema } from "@brand-listener/database";   
/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

  export const ENGAGEMENT_WEIGHTS = {
    reply: 4,
    quote: 3,
    retweet: 2,
    like: 1,
    view: 0.001
  } as const;

  export const FRESHNESS_DECAY = {
    halfLifeHours: 24,
    decayFactor: Math.log(0.5) / 24 
  } as const;

  export const ANALYTICS_VERSION = "1.0" as const;

  export const REPLY_THRESHOLD = 0.5;

  export const SEND_USERNAME = "Send";

/* -------------------------------------------------------------------------- */
/*                              FUNCTIONS                                     */
/* -------------------------------------------------------------------------- */

  export function calculateRawEngagementScore(tweet: schema.Tweet): number {
    return (
      ENGAGEMENT_WEIGHTS.reply * (tweet.replyCount || 0) +
      ENGAGEMENT_WEIGHTS.quote * (tweet.quoteCount || 0) +
      ENGAGEMENT_WEIGHTS.retweet * (tweet.retweetCount || 0) +
      ENGAGEMENT_WEIGHTS.like * (tweet.likeCount || 0) +
      ENGAGEMENT_WEIGHTS.view * (tweet.viewCount || 0)
    );
  }

  export function calculateAuthorSizeNormalization(authorFollowers: number): number {
    return Math.log10((authorFollowers || 0) + 10);
  }


  export function calculateFreshnessDecay(tweetCreatedAt: Date): { factor: number; ageInHours: number } {
    const now = new Date();
    const ageInHours = (now.getTime() - tweetCreatedAt.getTime()) / (1000 * 60 * 60);
    const decayFactor = Math.exp(FRESHNESS_DECAY.decayFactor * ageInHours);
    
    return {
      factor: Math.max(0.001, decayFactor), // Minimum decay factor to prevent zero scores
      ageInHours
    };
  }

  export function calculateFinalScore(rawEngagementScore: number, authorSizeNormalizationFactor: number, freshnessDecayFactor: number): number {
    return rawEngagementScore * authorSizeNormalizationFactor * freshnessDecayFactor;
  }

  export function calculateShouldReply(finalScore: number): boolean {
    return finalScore > REPLY_THRESHOLD;
  }

  export async function calculateTweetAnalytics(tweet: schema.Tweet): Promise<schema.InsertTweetAnalytics> {
    const rawEngagementScore = calculateRawEngagementScore(tweet);
    const authorSizeNormalizationFactor = calculateAuthorSizeNormalization(tweet.authorFollowers || 0);
    const freshnessDecayFactor = calculateFreshnessDecay(tweet.createdAtUtc).factor;
    const finalScore = calculateFinalScore(rawEngagementScore, authorSizeNormalizationFactor, freshnessDecayFactor);
    const shouldReply = calculateShouldReply(finalScore);

    return {
      tweetId: tweet.tweetId,
      rawEngagementScore: rawEngagementScore.toString(),
      normalizedEngagementScore: finalScore.toString(),
      freshnessAdjustedScore: finalScore.toString(),
      finalScore: finalScore.toString(),
      authorSizeNormalizationFactor: authorSizeNormalizationFactor.toString(),
      freshnessDecayFactor: freshnessDecayFactor.toString(),
      ageInHours: calculateFreshnessDecay(tweet.createdAtUtc).ageInHours.toString(),
      algorithmVersion: ANALYTICS_VERSION,
      computedAt: new Date(),
      shouldReply
    };
  }

  export async function calculateBatchTweetAnalytics(tweets: schema.Tweet[]): Promise<schema.InsertTweetAnalytics[]> {
    return Promise.all(tweets.map(tweet => calculateTweetAnalytics(tweet)));
  }

  export async function checkIfUserRepliedToTweet(reply: schema.InsertTweet): Promise<boolean> {
    if (reply.authorUsername === SEND_USERNAME) {
      return true;
    } else {
      return false;
    }
  } 