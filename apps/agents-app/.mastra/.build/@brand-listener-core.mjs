import { schema, getDb } from '@brand-listener/database';
import { eq, and, isNull, inArray, desc, gt, ne } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 } from 'uuid';
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';

var AnalyzerService = class {
  /**
   * Save parsed tweets with their media to the database
   * Handles duplicates by updating existing records
   * Returns the tweets enriched with their database IDs
   */
  static async saveParsedTweets(parsedTweets) {
    if (parsedTweets.length === 0) return [];
    const savedTweets = [];
    try {
      for (const parsedTweet of parsedTweets) {
        const { media, ...tweetData } = parsedTweet;
        const [tweet] = await getDb().insert(schema.tweetsAnalyzer).values(tweetData).onConflictDoUpdate({
          target: schema.tweetsAnalyzer.apiId,
          set: {
            retweetCount: parsedTweet.retweetCount,
            replyCount: parsedTweet.replyCount,
            likeCount: parsedTweet.likeCount,
            quoteCount: parsedTweet.quoteCount,
            viewCount: parsedTweet.viewCount,
            bookmarkCount: parsedTweet.bookmarkCount,
            evs: parsedTweet.evs,
            status: "scraped",
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        let savedMedia = [];
        if (media && media.length > 0) {
          savedMedia = await this.saveMediaForTweet(tweet.id, media);
        }
        const savedTweet = {
          ...tweet,
          media: savedMedia
        };
        savedTweets.push(savedTweet);
      }
      return savedTweets;
    } catch (error) {
      console.error("Error saving tweets to database:", error);
      throw error;
    }
  }
  /**
   * Save media for a specific tweet
   */
  static async saveMediaForTweet(tweetId, mediaItems) {
    await getDb().delete(schema.tweetMediaAnalyzer).where(eq(schema.tweetMediaAnalyzer.tweetId, tweetId));
    const mediaToInsert = mediaItems.map((media) => ({
      ...media,
      tweetId
    }));
    if (mediaToInsert.length > 0) {
      const result = await getDb().insert(schema.tweetMediaAnalyzer).values(mediaToInsert).returning();
      return result;
    }
    return [];
  }
  /*
   * Update media descriptions for a tweet after AI processing
   */
  static async updateMediaDescriptions(media) {
    await getDb().update(schema.tweetMediaAnalyzer).set({
      description: media.description,
      updatedAt: media.updatedAt
    }).where(eq(schema.tweetMediaAnalyzer.id, media.id));
    const tweetId = media.tweetId;
    await getDb().update(schema.tweetsAnalyzer).set({
      status: "visual_processed",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(schema.tweetsAnalyzer.id, tweetId));
  }
  static async getMediaByAuthorUsername(username) {
    return await getDb().select({
      id: schema.tweetMediaAnalyzer.id,
      tweetId: schema.tweetMediaAnalyzer.tweetId,
      url: schema.tweetMediaAnalyzer.url,
      type: schema.tweetMediaAnalyzer.type,
      description: schema.tweetMediaAnalyzer.description,
      scrapedAt: schema.tweetMediaAnalyzer.scrapedAt,
      updatedAt: schema.tweetMediaAnalyzer.updatedAt
    }).from(schema.tweetMediaAnalyzer).innerJoin(schema.tweetsAnalyzer, eq(schema.tweetMediaAnalyzer.tweetId, schema.tweetsAnalyzer.id)).where(and(eq(schema.tweetsAnalyzer.username, username), isNull(schema.tweetMediaAnalyzer.description))).orderBy(schema.tweetsAnalyzer.createdAt);
  }
  /**
   * Get all tweets
   */
  static async getAllTweets() {
    return await getDb().select().from(schema.tweetsAnalyzer).orderBy(schema.tweetsAnalyzer.createdAt);
  }
  /**
   * Get tweet by database ID
   */
  static async getTweetById(id) {
    const result = await getDb().select().from(schema.tweetsAnalyzer).where(eq(schema.tweetsAnalyzer.id, id)).limit(1);
    return result[0] || null;
  }
  /**
   * Get tweet by API ID (external tweet ID)
   */
  static async getTweetByApiId(apiId) {
    const result = await getDb().select().from(schema.tweetsAnalyzer).where(eq(schema.tweetsAnalyzer.apiId, apiId)).limit(1);
    return result[0] || null;
  }
};
var PENDING_TWEET_STATUS = schema.statusConstants.pending;
var READY_TO_RESPOND_TWEET_STATUS = schema.statusConstants.ready_to_respond;
var ERROR_TWEET_STATUS = schema.statusConstants.error;
var PROCESSED_TWEET_STATUS = schema.statusConstants.processed;
var REPLIED_TWEET_STATUS = schema.statusConstants.responded;
async function insertTweetsAndIgnoreDuplicates(tweets) {
  try {
    const db = getDb();
    const result = await db.insert(schema.tweetsTable).values(tweets).onConflictDoNothing(
      {
        target: [schema.tweetsTable.tweetId]
      }
    ).returning();
    return result;
  } catch (error) {
    console.error("Error inserting tweets", error);
    throw error;
  }
}
async function getPendingTweets() {
  try {
    const db = getDb();
    const result = await db.select().from(schema.tweetsTable).where(eq(schema.tweetsTable.status, PENDING_TWEET_STATUS));
    return result;
  } catch (error) {
    console.error("Error getting pending tweets", error);
    throw error;
  }
}
async function addReplyToTweet(tweetId, reply, reasoning) {
  try {
    const db = getDb();
    const result = await db.update(schema.tweetsTable).set({ reply, reasoning, status: READY_TO_RESPOND_TWEET_STATUS }).where(eq(schema.tweetsTable.tweetId, tweetId)).returning();
    if (result.length === 0) {
      throw new Error("Tweet not found");
    }
    return result[0];
  } catch (error) {
    console.error("Error updating tweet status", error);
    throw error;
  }
}
async function getMostRelevantTweetsToReplyTo({
  top_k = 10
}) {
  try {
    const db = getDb();
    const result = await db.select({
      tweet: schema.tweetsTable,
      analytics: schema.tweetAnalyticsTable
    }).from(schema.tweetsTable).innerJoin(
      schema.tweetAnalyticsTable,
      eq(schema.tweetsTable.tweetId, schema.tweetAnalyticsTable.tweetId)
    ).where(eq(schema.tweetsTable.status, READY_TO_RESPOND_TWEET_STATUS)).orderBy(desc(schema.tweetAnalyticsTable.finalScore)).limit(top_k);
    return result;
  } catch (error) {
    console.error("Error getting most relevant tweets to reply to", error);
    throw error;
  }
}
async function addErrorToTweet(tweetId, error) {
  try {
    const db = getDb();
    await db.update(schema.tweetsTable).set({ errors: [error], status: ERROR_TWEET_STATUS }).where(eq(schema.tweetsTable.tweetId, tweetId));
  } catch (error2) {
    console.error("Error adding error to tweet", error2);
    throw error2;
  }
}
async function setTweetStatus(tweetId, status) {
  try {
    const db = getDb();
    await db.update(schema.tweetsTable).set({ status }).where(eq(schema.tweetsTable.tweetId, tweetId));
    return true;
  } catch (error) {
    console.error("Error setting tweet status", error);
    throw error;
  }
}
async function batchSetTweetStatus(tweetIds, status) {
  try {
    const db = getDb();
    await db.update(schema.tweetsTable).set({ status }).where(inArray(schema.tweetsTable.tweetId, tweetIds));
    return true;
  } catch (error) {
    console.error("Error setting tweet status", error);
    throw error;
  }
}
async function addAnalyticsToTweet(analytics) {
  try {
    const db = getDb();
    await db.insert(schema.tweetAnalyticsTable).values(analytics).onConflictDoUpdate({
      target: [schema.tweetAnalyticsTable.tweetId],
      set: {
        rawEngagementScore: schema.tweetAnalyticsTable.rawEngagementScore,
        normalizedEngagementScore: schema.tweetAnalyticsTable.normalizedEngagementScore,
        freshnessAdjustedScore: schema.tweetAnalyticsTable.freshnessAdjustedScore,
        finalScore: schema.tweetAnalyticsTable.finalScore,
        authorSizeNormalizationFactor: schema.tweetAnalyticsTable.authorSizeNormalizationFactor,
        freshnessDecayFactor: schema.tweetAnalyticsTable.freshnessDecayFactor,
        ageInHours: schema.tweetAnalyticsTable.ageInHours,
        shouldReply: schema.tweetAnalyticsTable.shouldReply,
        algorithmVersion: schema.tweetAnalyticsTable.algorithmVersion,
        computedAt: /* @__PURE__ */ new Date()
      }
    });
    await setTweetStatus(analytics.tweetId, PROCESSED_TWEET_STATUS);
    console.log("Added analytics to tweet", analytics.tweetId);
  } catch (error) {
    console.error("Error adding analytics to tweet", error);
    throw error;
  }
}
async function batchAddAnalyticsToTweets(analytics) {
  try {
    const db = getDb();
    await db.insert(schema.tweetAnalyticsTable).values(analytics).onConflictDoUpdate({
      target: [schema.tweetAnalyticsTable.tweetId],
      set: {
        rawEngagementScore: schema.tweetAnalyticsTable.rawEngagementScore,
        normalizedEngagementScore: schema.tweetAnalyticsTable.normalizedEngagementScore,
        freshnessAdjustedScore: schema.tweetAnalyticsTable.freshnessAdjustedScore,
        finalScore: schema.tweetAnalyticsTable.finalScore,
        authorSizeNormalizationFactor: schema.tweetAnalyticsTable.authorSizeNormalizationFactor,
        freshnessDecayFactor: schema.tweetAnalyticsTable.freshnessDecayFactor,
        ageInHours: schema.tweetAnalyticsTable.ageInHours,
        shouldReply: schema.tweetAnalyticsTable.shouldReply,
        algorithmVersion: schema.tweetAnalyticsTable.algorithmVersion,
        computedAt: /* @__PURE__ */ new Date()
      }
    });
    await batchSetTweetStatus(analytics.map((a) => a.tweetId), PROCESSED_TWEET_STATUS);
    console.log("Added analytics to tweets", analytics.map((a) => a.tweetId));
  } catch (error) {
    console.error("Error adding analytics to tweet", error);
    throw error;
  }
}
async function getTweetAnalytics(tweetId) {
  try {
    const db = getDb();
    const result = await db.select().from(schema.tweetAnalyticsTable).where(eq(schema.tweetAnalyticsTable.tweetId, tweetId));
    return result;
  } catch (error) {
    console.error("Error getting tweet analytics", error);
    throw new Error("Error getting tweet analytics");
  }
}
async function getTweetCandidates() {
  try {
    const db = getDb();
    const result = await db.select({
      tweet: schema.tweetsTable,
      analytics: schema.tweetAnalyticsTable
    }).from(schema.tweetsTable).innerJoin(
      schema.tweetAnalyticsTable,
      eq(schema.tweetsTable.tweetId, schema.tweetAnalyticsTable.tweetId)
    ).where(
      and(
        gt(schema.tweetAnalyticsTable.finalScore, "5"),
        eq(schema.tweetsTable.isReply, false),
        ne(schema.tweetsTable.status, REPLIED_TWEET_STATUS),
        ne(schema.tweetsTable.status, ERROR_TWEET_STATUS),
        ne(schema.tweetsTable.status, READY_TO_RESPOND_TWEET_STATUS)
      )
    );
    return result;
  } catch (error) {
    console.error("Error getting tweet candidates", error);
    throw error;
  }
}
var ENGAGEMENT_WEIGHTS = {
  reply: 4,
  quote: 3,
  retweet: 2,
  like: 1,
  view: 1e-3
};
var FRESHNESS_DECAY = {
  halfLifeHours: 24,
  decayFactor: Math.log(0.5) / 24
};
var ANALYTICS_VERSION = "1.0";
var REPLY_THRESHOLD = 0.5;
var TWITTER_USERNAME = process.env.TWITTER_USERNAME;
function calculateRawEngagementScore(tweet) {
  return ENGAGEMENT_WEIGHTS.reply * (tweet.replyCount || 0) + ENGAGEMENT_WEIGHTS.quote * (tweet.quoteCount || 0) + ENGAGEMENT_WEIGHTS.retweet * (tweet.retweetCount || 0) + ENGAGEMENT_WEIGHTS.like * (tweet.likeCount || 0) + ENGAGEMENT_WEIGHTS.view * (tweet.viewCount || 0);
}
function calculateAuthorSizeNormalization(authorFollowers) {
  return Math.log10((authorFollowers || 0) + 10);
}
function calculateFreshnessDecay(tweetCreatedAt) {
  const now = /* @__PURE__ */ new Date();
  const ageInHours = (now.getTime() - tweetCreatedAt.getTime()) / (1e3 * 60 * 60);
  const decayFactor = Math.exp(FRESHNESS_DECAY.decayFactor * ageInHours);
  return {
    factor: Math.max(1e-3, decayFactor),
    // Minimum decay factor to prevent zero scores
    ageInHours
  };
}
function calculateFinalScore(rawEngagementScore, authorSizeNormalizationFactor, freshnessDecayFactor) {
  return rawEngagementScore * authorSizeNormalizationFactor * freshnessDecayFactor;
}
function calculateShouldReply(finalScore) {
  return finalScore > REPLY_THRESHOLD;
}
async function calculateTweetAnalytics(tweet) {
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
    computedAt: /* @__PURE__ */ new Date(),
    shouldReply
  };
}
async function calculateBatchTweetAnalytics(tweets) {
  return Promise.all(tweets.map((tweet) => calculateTweetAnalytics(tweet)));
}
async function checkIfUserRepliedToTweet(reply) {
  if (reply.authorUsername?.toLowerCase() === TWITTER_USERNAME?.toLowerCase()) {
    return true;
  } else {
    return false;
  }
}
var SlackClient = class {
  webhookUrl;
  constructor(webhookUrl) {
    if (!webhookUrl) {
      throw new Error("Webhook URL is required");
    }
    this.webhookUrl = webhookUrl;
  }
  async postMessage(message) {
    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });
    if (!response.ok) {
      const body2 = await response.text();
      throw new Error(`Failed to post message to Slack: ${response.statusText} ${body2}`);
    }
    const body = await response.text();
    console.log("Slack response:", body);
    return {
      ok: response.ok,
      status: response.status,
      body
    };
  }
  async postText(text) {
    return this.postMessage({ text });
  }
};
var generateVisualDescription = async (type, url) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Google API key is not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  let prompt = "";
  let mimeType = "";
  if (type === "video") {
    prompt = "Transcribe the audio from this video, giving timestamps for salient events in the video. Also provide visual descriptions.";
    mimeType = "video/mp4";
  } else if (type === "photo" || type === "image") {
    prompt = "Detail this image in full";
    mimeType = "image/jpeg";
  } else {
    prompt = "Describe this media in detail.";
    mimeType = "";
  }
  const tempFile = await downloadToTemp(url);
  try {
    const file = await ai.files.upload({
      file: tempFile,
      config: { mimeType }
    });
    console.log("Uploaded file:", file);
    if (!file.name) {
      throw new Error("File name is required");
    }
    const activeFile = await waitForFileActive(ai, file.name);
    const content = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(
          activeFile.uri,
          activeFile.mimeType
        ),
        prompt
      ])
    });
    console.log("result.text=", content.text);
    if (!content.text) {
      throw new Error("No text returned from Gemini");
    }
    return content.text;
  } finally {
    await fs.unlink(tempFile).catch(() => {
    });
  }
};
async function downloadToTemp(url) {
  const ext = path.extname(url).split("?")[0] || "";
  const tempFile = path.join(os.tmpdir(), `media-${v4()}${ext}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download file: ${url}`);
  const buffer = await res.arrayBuffer();
  await fs.writeFile(tempFile, Buffer.from(buffer));
  return tempFile;
}
async function waitForFileActive(ai, fileName, maxWaitMs = 6e4) {
  const startTime = Date.now();
  let delay = 1e3;
  const maxDelay = 1e4;
  while (Date.now() - startTime < maxWaitMs) {
    const file = await ai.files.get({ name: fileName });
    console.log(`File state: ${file.state}`);
    if (file.state === "ACTIVE") {
      return file;
    }
    if (file.state === "FAILED") {
      throw new Error(`File processing failed: ${fileName}`);
    }
    console.log(`Waiting ${delay}ms before next check...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, maxDelay);
  }
  throw new Error(`File processing timeout: ${fileName}`);
}

export { ANALYTICS_VERSION, AnalyzerService, ENGAGEMENT_WEIGHTS, ERROR_TWEET_STATUS, FRESHNESS_DECAY, PENDING_TWEET_STATUS, PROCESSED_TWEET_STATUS, READY_TO_RESPOND_TWEET_STATUS, REPLIED_TWEET_STATUS, REPLY_THRESHOLD, SlackClient, TWITTER_USERNAME, addAnalyticsToTweet, addErrorToTweet, addReplyToTweet, batchAddAnalyticsToTweets, batchSetTweetStatus, calculateAuthorSizeNormalization, calculateBatchTweetAnalytics, calculateFinalScore, calculateFreshnessDecay, calculateRawEngagementScore, calculateShouldReply, calculateTweetAnalytics, checkIfUserRepliedToTweet, generateVisualDescription, getMostRelevantTweetsToReplyTo, getPendingTweets, getTweetAnalytics, getTweetCandidates, insertTweetsAndIgnoreDuplicates, setTweetStatus };
