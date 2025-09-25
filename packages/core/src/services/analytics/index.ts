import { schema } from "@vibeflow/database";
/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

export const ENGAGEMENT_WEIGHTS = {
  reply: 4,
  quote: 3,
  retweet: 2,
  like: 1,
  view: 0.5  // Increased from 0.001 since we'll use log scaling
} as const;

export const FRESHNESS_DECAY = {
  halfLifeHours: 24,
  decayFactor: Math.log(0.5) / 24
} as const;

// Score normalization constants
export const SCORE_NORMALIZATION = {
  maxRawScore: 100,        // Target max for raw engagement score
  maxFinalScore: 1000,     // Target max for final score
  logBase: 10,             // Base for logarithmic scaling
  minEngagementForLog: 1   // Minimum engagement count before applying log
} as const;

export const ANALYTICS_VERSION = "2.0" as const;  // Updated version

export const REPLY_THRESHOLD = 50;

export const TWITTER_USERNAME = process.env.TWITTER_USERNAME;

/* -------------------------------------------------------------------------- */
/*                              FUNCTIONS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Apply logarithmic scaling to engagement metrics to handle wide value ranges
 */
function normalizeEngagementMetric(value: number): number {
  if (value <= SCORE_NORMALIZATION.minEngagementForLog) {
    return value;
  }
  return Math.log(value + 1) / Math.log(SCORE_NORMALIZATION.logBase);
}

/**
 * Calculate normalized raw engagement score using logarithmic scaling
 * 
 * This prevents massive scores from viral tweets (millions of views) by:
 * 1. Applying log scaling to each engagement metric
 * 2. Capping the final raw score at maxRawScore (100)
 * 
 * Example: 1M views -> log10(1M+1) = ~6, instead of contributing 1M to score
 */
export function calculateRawEngagementScore(tweet: schema.Tweet): number {
  const normalizedScore = (
    ENGAGEMENT_WEIGHTS.reply * normalizeEngagementMetric(tweet.replyCount || 0) +
    ENGAGEMENT_WEIGHTS.quote * normalizeEngagementMetric(tweet.quoteCount || 0) +
    ENGAGEMENT_WEIGHTS.retweet * normalizeEngagementMetric(tweet.retweetCount || 0) +
    ENGAGEMENT_WEIGHTS.like * normalizeEngagementMetric(tweet.likeCount || 0) +
    ENGAGEMENT_WEIGHTS.view * normalizeEngagementMetric(tweet.viewCount || 0)
  );
  
  // Scale to target range and cap at maximum
  return Math.min(normalizedScore, SCORE_NORMALIZATION.maxRawScore);
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
  const finalScore = rawEngagementScore * authorSizeNormalizationFactor * freshnessDecayFactor;
  // Cap final score at maximum to prevent overflow
  return Math.min(finalScore, SCORE_NORMALIZATION.maxFinalScore);
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
    tweetId: tweet.id,
    rawEngagementScore: rawEngagementScore.toString(),
    normalizedEngagementScore: finalScore.toString(),
    freshnessAdjustedScore: finalScore.toString(),
    finalScore: finalScore.toString(),
    authorSizeNormalizationFactor: authorSizeNormalizationFactor.toString(),
    freshnessDecayFactor: freshnessDecayFactor.toString(),
    ageInHours: calculateFreshnessDecay(tweet.createdAtUtc).ageInHours.toString(),
    algorithmVersion: ANALYTICS_VERSION,
    computedAtUtc: new Date(),
    shouldReply
  };
}

export async function calculateBatchTweetAnalytics(tweets: schema.Tweet[]): Promise<schema.InsertTweetAnalytics[]> {
  return Promise.all(tweets.map(tweet => calculateTweetAnalytics(tweet)));
}

export async function checkIfUserRepliedToTweet(reply: schema.InsertTweet): Promise<boolean> {
  if (reply.authorUsername?.toLowerCase() === TWITTER_USERNAME?.toLowerCase()) {
    return true;
  } else {
    return false;
  }
} 