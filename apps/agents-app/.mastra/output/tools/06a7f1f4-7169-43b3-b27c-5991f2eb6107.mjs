import { createTool } from '@mastra/core/tools';
import * as TwitterDatabaseService from '@brand-listener/core';
import { AnalyzerService, generateVisualDescription } from '@brand-listener/core';
import { z } from 'zod';

function transformTwitterAnalyzerResponse(apiResponse) {
  const transformedTweets = apiResponse.data.tweets.map(
    (tweet) => transformTweetToAnalyzerDbFormat(tweet)
  );
  return {
    tweets: transformedTweets,
    hasNextPage: apiResponse.has_next_page,
    nextCursor: apiResponse.next_cursor
  };
}
var transformTweetToAnalyzerDbFormat = (tweet) => {
  const mediaArr = tweet.extendedEntities?.media || [];
  const media = extractMedia(mediaArr);
  const evs = computeEvs(tweet);
  const type = media.length > 0 ? media[0].type : "text";
  return {
    apiId: tweet.id,
    url: tweet.url,
    text: tweet.text,
    retweetCount: tweet.retweetCount,
    replyCount: tweet.replyCount,
    likeCount: tweet.likeCount,
    quoteCount: tweet.quoteCount,
    viewCount: tweet.viewCount,
    bookmarkCount: tweet.bookmarkCount,
    username: tweet.author.userName,
    type,
    media,
    createdAt: new Date(tweet.createdAt),
    evs
  };
};
var extractMedia = (mediaArr) => {
  if (!Array.isArray(mediaArr)) return [];
  return mediaArr.map((media) => {
    if (media.type === "video" && media.video_info && Array.isArray(media.video_info.variants)) {
      const mp4s = media.video_info.variants.filter((v) => v.content_type === "video/mp4");
      let best = mp4s[0];
      for (const v of mp4s) {
        if (!best || v.bitrate && (!best.bitrate || v.bitrate > best.bitrate)) {
          best = v;
        }
      }
      return {
        type: "video",
        url: best.url
      };
    } else {
      return {
        type: media.type,
        url: media.media_url_https
      };
    }
  });
};
var computeEvs = (tweet) => {
  const weights = {
    like: 0.1,
    reply: 0.3,
    retweet: 0.2,
    quote: 0.25,
    bookmark: 0.4
  };
  const scale = 1e3;
  const numerator = weights.like * tweet.likeCount + weights.reply * tweet.replyCount + weights.retweet * tweet.retweetCount + weights.quote * tweet.quoteCount + weights.bookmark * tweet.bookmarkCount;
  return tweet.viewCount > 0 ? Number((scale * numerator / tweet.viewCount).toFixed(4)) : 0;
};
var twitterAuthorSchema = z.object({
  type: z.literal("user"),
  userName: z.string(),
  url: z.string(),
  twitterUrl: z.string(),
  id: z.string(),
  name: z.string(),
  isVerified: z.boolean(),
  isBlueVerified: z.boolean(),
  verifiedType: z.string().nullable(),
  profilePicture: z.string(),
  coverPicture: z.string().optional(),
  description: z.string(),
  location: z.string(),
  followers: z.number(),
  following: z.number(),
  status: z.string(),
  canDm: z.boolean(),
  canMediaTag: z.boolean(),
  createdAt: z.string(),
  entities: z.object({
    description: z.object({
      urls: z.array(z.unknown())
    })
  })
}).passthrough();
var twitterTweetSchema = z.object({
  type: z.literal("tweet"),
  id: z.string(),
  url: z.string(),
  twitterUrl: z.string(),
  text: z.string(),
  source: z.string(),
  retweetCount: z.number(),
  replyCount: z.number(),
  likeCount: z.number(),
  quoteCount: z.number(),
  viewCount: z.number(),
  createdAt: z.string(),
  lang: z.string(),
  bookmarkCount: z.number(),
  isReply: z.boolean(),
  inReplyToId: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
  displayTextRange: z.tuple([z.number(), z.number()]),
  inReplyToUserId: z.string().optional().nullable(),
  inReplyToUsername: z.string().optional().nullable(),
  author: twitterAuthorSchema,
  extendedEntities: z.object({
    media: z.array(z.object({
      type: z.string(),
      media_url_https: z.string(),
      video_info: z.object({
        variants: z.array(z.object({
          url: z.string(),
          content_type: z.string()
        }))
      }).optional()
    })).optional()
  })
}).passthrough();
var lastTweetsApiResponseSchema = z.object({
  data: z.object({
    tweets: z.array(twitterTweetSchema)
  }),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional().nullable(),
  status: z.string(),
  msg: z.string()
});
var twitterApiResponseSchema = z.object({
  tweets: z.array(twitterTweetSchema),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional().nullable(),
  status: z.string(),
  msg: z.string()
});
var TWITTER_API_BASE_URL = "https://api.twitterapi.io";
var USER_MENTIONS_ENDPOINT = "/twitter/user/mentions";
var REPLIES_ENDPOINT = "/twitter/tweet/replies";
var LAST_TWEETS_ENDPOINT = "/twitter/user/last_tweets";
var TwitterClient = class {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async makeRequest(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": this.apiKey,
        "Accept": "application/json"
      }
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("\u274C API Error:", JSON.stringify(data, null, 2));
      throw new Error(`HTTP error! status: ${response.status}, data: ${JSON.stringify(data)}`);
    }
    return data;
  }
  async mentions({
    userName,
    sinceTime,
    cursor
  }) {
    try {
      const url = new URL(USER_MENTIONS_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set("userName", userName);
      url.searchParams.set("sinceTime", Math.floor(sinceTime.getTime() / 1e3).toString());
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }
      const rawData = await this.makeRequest(url.toString());
      const response = twitterApiResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error("\u274C Error in mentions:", error);
      throw error;
    }
  }
  async getReplies(tweetId, cursor) {
    try {
      const url = new URL(REPLIES_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set("tweetId", tweetId);
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }
      const rawData = await this.makeRequest(url.toString());
      const response = twitterApiResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error("\u274C Error in replies:", error);
      throw error;
    }
  }
  async getLastTweets(userName, cursor) {
    try {
      const url = new URL(LAST_TWEETS_ENDPOINT, TWITTER_API_BASE_URL);
      url.searchParams.set("userName", userName);
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }
      const rawData = await this.makeRequest(url.toString());
      const response = lastTweetsApiResponseSchema.parse(rawData);
      return response;
    } catch (error) {
      console.error("\u274C Error in last tweets:", error);
      throw error;
    }
  }
};
async function ingestUserLastTweets(config) {
  const {
    userName,
    maxPages = 1,
    cursor: initialCursor
  } = config;
  if (!process.env.TWITTER_API_KEY) {
    throw new Error("TWITTER_API_KEY is not set");
  }
  const client = new TwitterClient(process.env.TWITTER_API_KEY);
  try {
    let cursor = initialCursor;
    let hasNextPage = true;
    let pageCount = 0;
    let totalTweets = 0;
    console.log(`\u{1F680} Starting user last tweets ingestion for @${userName}`);
    while (hasNextPage && pageCount < maxPages) {
      pageCount++;
      console.log(`\u{1F4C4} Fetching page ${pageCount}${cursor ? ` with cursor: ${cursor}` : ""}`);
      const response = await client.getLastTweets(userName, cursor);
      const transformed = transformTwitterAnalyzerResponse(response);
      if (transformed.tweets.length > 0) {
        const result = await TwitterDatabaseService.AnalyzerService.saveParsedTweets(transformed.tweets);
        console.log(`\u{1F4BE} Uploaded ${result.length} tweets`);
        totalTweets += transformed.tweets.length;
      } else {
        console.log("No tweets found for this page");
        break;
      }
      hasNextPage = transformed.hasNextPage;
      cursor = transformed.nextCursor || void 0;
      console.log(`\u2705 Page ${pageCount}: Found ${transformed.tweets.length} tweets, hasNextPage: ${hasNextPage}`);
    }
    const reachedMaxPages = pageCount >= maxPages;
    if (reachedMaxPages) {
      console.log(`\u26A0\uFE0F  Reached maximum page limit (${maxPages}). There may be more tweets available.`);
    }
    console.log(`\u{1F389} Complete! Processed ${totalTweets} total tweets across ${pageCount} pages`);
    return {
      success: true,
      totalTweets,
      pagesProcessed: pageCount,
      nextCursor: cursor,
      hasMorePages: reachedMaxPages && hasNextPage
    };
  } catch (error) {
    console.error(`\u274C User last tweets ingestion failed:`, error);
    return {
      success: false,
      totalTweets: 0,
      pagesProcessed: 0,
      hasMorePages: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
var TwitterAnalyser = class {
  userName;
  maxPages;
  apiKey;
  databaseUrl;
  constructor(config) {
    this.userName = config.userName;
    this.maxPages = config.maxPages || 1;
    this.apiKey = config.apiKey || process.env.TWITTER_API_KEY || "";
    this.databaseUrl = config.databaseUrl || process.env.DATABASE_URL || "";
    this.validateConfiguration();
  }
  /**
   * Validate that all required configuration is present
   */
  validateConfiguration() {
    if (!this.userName) {
      throw new Error("userName is required");
    }
    if (!this.maxPages) {
      throw new Error("maxPages is required");
    }
    if (!this.apiKey) {
      throw new Error("TWITTER_API_KEY is not set");
    }
    if (!this.databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
  }
  /**
   * Run the complete Twitter analysis process
   */
  async run() {
    try {
      console.log(`\u{1F680} Starting Twitter analysis for @${this.userName}`);
      const ingestionResult = await this.ingestUserLastTweets();
      if (!ingestionResult.success) {
        return {
          success: false,
          ingestionResult,
          mediaProcessed: 0,
          error: ingestionResult.error || "Ingestion failed"
        };
      }
      console.log(`\u2705 Ingestion complete: ${ingestionResult.totalTweets} tweets processed`);
      const mediaProcessed = await this.generateMediaDescriptions();
      console.log(`\u2705 Analysis complete: ${mediaProcessed} media items processed`);
      return {
        success: true,
        ingestionResult,
        mediaProcessed
      };
    } catch (error) {
      console.error("\u274C Twitter analysis failed:", error);
      return {
        success: false,
        ingestionResult: {
          success: false,
          totalTweets: 0,
          pagesProcessed: 0,
          hasMorePages: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        mediaProcessed: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Ingest the user's last tweets
   */
  async ingestUserLastTweets() {
    console.log(`\u{1F4E5} Starting tweet ingestion for @${this.userName}`);
    const result = await ingestUserLastTweets({
      userName: this.userName,
      maxPages: this.maxPages
    });
    return result;
  }
  /**
   * Generate AI descriptions for media content in tweets
   */
  async generateMediaDescriptions() {
    console.log(`\u{1F3A8} Starting media description generation for @${this.userName}`);
    const mediaItems = await AnalyzerService.getMediaByAuthorUsername(this.userName);
    if (mediaItems.length === 0) {
      console.log("No media items found that need description generation");
      return 0;
    }
    console.log(`Found ${mediaItems.length} media items to process`);
    const results = await Promise.allSettled(
      mediaItems.map(async (media) => {
        try {
          const description = await generateVisualDescription(media.type, media.url);
          media.description = description;
          media.updatedAt = /* @__PURE__ */ new Date();
          await AnalyzerService.updateMediaDescriptions(media);
          return true;
        } catch (error) {
          console.error(`\u274C Failed to process media ${media.id}:`, error);
          return false;
        }
      })
    );
    const successfulProcessing = results.filter(
      (result) => result.status === "fulfilled" && result.value === true
    ).length;
    console.log(`\u2705 Successfully processed ${successfulProcessing} of ${mediaItems.length} media items`);
    return successfulProcessing;
  }
  /**
   * Get analysis statistics for the user
   */
  async getAnalysisStats() {
    const mediaItems = await AnalyzerService.getMediaByAuthorUsername(this.userName);
    const processedMedia = mediaItems.filter((media) => media.description).length;
    return {
      totalTweets: 0,
      // Would need AnalyzerService.getTweetCountByUsername(this.userName)
      mediaItems: mediaItems.length,
      processedMedia
    };
  }
};
async function createAndRunTwitterAnalyser(userName, maxPages) {
  const targetUserName = userName;
  const analyser = new TwitterAnalyser({
    userName: targetUserName,
    maxPages
  });
  return await analyser.run();
}
async function main() {
  const result = await createAndRunTwitterAnalyser(
    "Send"
  );
  if (result.success) {
    console.log("\u2705 Twitter analysis completed successfully");
    console.log(`\u{1F4CA} Summary: ${result.ingestionResult.totalTweets} tweets, ${result.mediaProcessed} media processed`);
  } else {
    console.error("\u274C Twitter analysis failed:", result.error);
    throw new Error(result.error);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const { config } = await import('dotenv');
  config({ path: "/Users/alexandergirardet/Code/vibeflow/vibeflow-projects/vibeflow-v2/.env" });
  main().then(() => {
    console.log("\u2705 Main process finished");
    process.exit(0);
  }).catch((error) => {
    console.error("\u274C Main process failed:", error);
    process.exit(1);
  });
}

const twitterSearcherTool = createTool({
  id: "twitter-scraper",
  description: "Search for tweets from a user and get info on any media in the tweets",
  inputSchema: z.object({
    userName: z.string().describe("Twitter username to analyze"),
    numTweets: z.number().describe("Number of tweets to analyze")
  }),
  outputSchema: z.object({
    summary: z.object({
      username: z.string()
    })
  }),
  execute: async ({ context }) => {
    try {
      const twitterAnalyser = new TwitterAnalyser({
        userName: context.userName,
        maxPages: context.numTweets / 20
      });
      const tweetsForOutput = await twitterAnalyser.run();
      return {
        summary: {
          totalTweets: tweetsForOutput.ingestionResult.totalTweets,
          username: context.userName
        }
      };
    } catch (error) {
      throw new Error(`Failed to scrape tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

export { twitterSearcherTool };
//# sourceMappingURL=06a7f1f4-7169-43b3-b27c-5991f2eb6107.mjs.map
