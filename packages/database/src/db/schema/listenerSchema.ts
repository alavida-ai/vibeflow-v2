import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  jsonb,
  boolean,
  pgEnum,
  timestamp,
  index,
  numeric,
  decimal
} from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
// Status enum for tweet processing pipeline
/** Tweet processing pipeline statuses */
export const tweetStatusEnumSchema = z.enum([
  "pending",            // collected, not processed
  "processed",          // analytics computed
  "notified",           // pushed to Slack/alerts
  "ready_to_respond",   // queued for human approval/agent pass
  "responded",          // reply posted
  "ignored",            // intentionally not engaging
  "error",              // error processing tweet
]);

export const statusConstants = tweetStatusEnumSchema.enum;


export const tweetStatusEnum = pgEnum("tweet_status", tweetStatusEnumSchema.options as [string, ...string[]]);
// Main table for processed tweets (your "hits")
export const tweetsTable = pgTable("tweets", {
  /** Surrogate PK for convenience (keep tweetId unique for idempotency) */
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  /** Idempotency key from API */
  tweetId: varchar("tweet_id", { length: 64 }).notNull().unique(),

  /** Basic tweet fields */
  text: text("text").notNull(),
  language: varchar("lang", { length: 10 }), // e.g. 'en', 'fr'
  tweetUrl: text("tweet_url").notNull(),     // use twitterUrl/url from API

  /** Author (lightweight) */
  authorId: varchar("author_id", { length: 64 }).notNull(),
  authorUsername: varchar("author_username", { length: 255 }),
  authorName: varchar("author_name", { length: 255 }),
  authorFollowers: integer("author_followers").default(0),

  /** Threading / context */
  conversationId: varchar("conversation_id", { length: 64 }),
  isReply: boolean("is_reply").notNull().default(false),
  inReplyToId: varchar("in_reply_to_id", { length: 64 }),
  inReplyToUsername: varchar("in_reply_to_username", { length: 255 }),

  /** Engagement metrics (snapshot; overwrite on re-ingest if you want latest) */
  likeCount: integer("like_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  retweetCount: integer("retweet_count").notNull().default(0),
  quoteCount: integer("quote_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),

  /** Timestamps */
  createdAtUtc: timestamp("created_at_utc", { withTimezone: true }).notNull(), // from API
  capturedAtUtc: timestamp("captured_at_utc", { withTimezone: true }).defaultNow().notNull(), // when ingested
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  /** Pipeline state */
  status: tweetStatusEnum("status").notNull().default("pending"),
  errors: jsonb("errors").$type<string[]>().default([]),

  /** Safety / provenance */
  source: varchar("source", { length: 32 }).notNull().default("mentions"),
  rawJson: jsonb("raw_json").notNull(), // full payload for reprocessing

  reply: text("reply"),
  reasoning: text("reasoning")
}, (table) => [
  index("idx_tweets_tweet_id").on(table.tweetId),
  // Analytics optimization indexes
  index("idx_tweets_created_status").on(table.createdAtUtc, table.status),
  index("idx_tweets_captured_time").on(table.capturedAtUtc),
  index("idx_tweets_author_status_updated").on(table.authorId, table.status, table.updatedAt),
  index("idx_tweets_language").on(table.language),
  index("idx_tweets_status").on(table.status),
]);

// Tweet analytics table for storing computed engagement scores and metrics
export const tweetAnalyticsTable = pgTable("tweet_analytics", {
  /** Surrogate PK */
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  /** Foreign key to tweets table */
  tweetId: varchar("tweet_id", { length: 64 }).notNull().unique().references(() => tweetsTable.tweetId),

  /** Computed analytics scores */
  rawEngagementScore: decimal("raw_engagement_score", { precision: 10, scale: 3 }).notNull().default("0.0"),
  normalizedEngagementScore: decimal("normalized_engagement_score", { precision: 10, scale: 6 }).notNull().default("0.0"),
  freshnessAdjustedScore: decimal("freshness_adjusted_score", { precision: 10, scale: 6 }).notNull().default("0.0"),
  finalScore: decimal("final_score", { precision: 10, scale: 6 }).notNull().default("0.0"),

  /** Normalization and decay factors */
  authorSizeNormalizationFactor: decimal("author_size_normalization_factor", { precision: 10, scale: 6 }).notNull().default("0.0"),
  freshnessDecayFactor: decimal("freshness_decay_factor", { precision: 10, scale: 6 }).notNull().default("0.0"),
  
  /** Age and time metadata */
  ageInHours: decimal("age_in_hours", { precision: 10, scale: 2 }).notNull().default("0.0"),

  shouldReply: boolean("should_reply").notNull().default(false),

  /** Analytics metadata */
  algorithmVersion: varchar("algorithm_version", { length: 16 }).notNull().default("1.0"),
  computedAt: timestamp("computed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_tweet_analytics_tweet_id").on(table.tweetId),
  index("idx_tweet_analytics_final_score").on(table.finalScore),
  index("idx_tweet_analytics_should_reply").on(table.shouldReply),
  index("idx_tweet_analytics_computed_at").on(table.computedAt),
]);

export const tweetSelectSchema = createSelectSchema(tweetsTable);
export const tweetInsertSchema = createInsertSchema(tweetsTable);
export const tweetAnalyticsSelectSchema = createSelectSchema(tweetAnalyticsTable);
export const tweetAnalyticsInsertSchema = createInsertSchema(tweetAnalyticsTable);

export type Tweet = typeof tweetsTable.$inferSelect;
export type InsertTweet = typeof tweetsTable.$inferInsert;
export type TweetAnalytics = typeof tweetAnalyticsTable.$inferSelect;
export type InsertTweetAnalytics = typeof tweetAnalyticsTable.$inferInsert;