import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  varchar,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  decimal
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';


// Enums
// Tweet processing pipeline statuses
export const tweetReplyStatusEnumSchema = z.enum([
  "pending",            // collected, not processed
  "processed",          // analytics computed
  "notified",           // pushed to Slack/alerts
  "ready_to_respond",   // queued for human approval/agent pass
  "responded",          // reply posted
  "ignored",            // intentionally not engaging
  "error",              // error processing tweet
]);

export const replyStatusConstants = tweetReplyStatusEnumSchema.enum;
export const tweetReplyStatusEnum = pgEnum("tweet_reply_status", tweetReplyStatusEnumSchema.options as [string, ...string[]]);

// Tweet source enum
export const tweetSourceEnumSchema = z.enum([
  "user-mentions",
  "tweet-replies", 
  "user-last-tweets"
]);

export const sourceConstants = tweetSourceEnumSchema.enum;
export const tweetSourceEnum = pgEnum("tweet_source", tweetSourceEnumSchema.options as [string, ...string[]]);
export type TweetSourceEnum = z.infer<typeof tweetSourceEnumSchema>;

// Media type enum
export const tweetMediaTypeEnumSchema = z.enum([
  "photo",
  "video",
  "animated_gif"
]);

export const tweetMediaTypeEnum = pgEnum("tweet_media_type", tweetMediaTypeEnumSchema.options as [string, ...string[]]);


// Tables
export const tweets = pgTable("tweets", {
  /** Surrogate PK for convenience (keep tweetId unique for idempotency) */
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  /** Idempotency key from API */
  apiId: varchar("api_id", { length: 64 }).notNull().unique(),

  /** Basic tweet fields */
  text: text("text").notNull(),
  language: varchar("lang", { length: 10 }), // e.g. 'en', 'fr'
  url: text("url").notNull(),     // use twitterUrl/url from API

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
  bookmarkCount: integer("bookmark_count").notNull().default(0), // NEW UNIFIED FIELD

  /** Timestamps */
  createdAtUtc: timestamp("created_at_utc", { withTimezone: true }).notNull(), // from API
  capturedAtUtc: timestamp("captured_at_utc", { withTimezone: true }).defaultNow().notNull(), // when ingested
  updatedAtUtc: timestamp("updated_at_utc", { withTimezone: true }).defaultNow().notNull(),

  /** Safety / provenance */
  source: tweetSourceEnum("source").notNull().default("user-mentions"),
  rawJson: jsonb("raw_json").notNull(), // full payload for reprocessing

}, (table) => [
  index("idx_tweets_api_id").on(table.apiId),
  // Analytics optimization indexes
  index("idx_tweets_created_time").on(table.createdAtUtc),
  index("idx_tweets_captured_time").on(table.capturedAtUtc),
  index("idx_tweets_author_updated").on(table.authorId, table.updatedAtUtc),
  index("idx_tweets_language").on(table.language),
  index("idx_tweets_source").on(table.source)
]);

// Tweet analytics table for storing computed engagement scores and metrics
export const tweetAnalytics = pgTable("tweet_analytics", {
  /** Surrogate PK */
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  /** Foreign key to tweets table */
  tweetId: integer('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),

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
  computedAtUtc: timestamp("computed_at_utc", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_tweet_analytics_tweet_id").on(table.tweetId),
  index("idx_tweet_analytics_final_score").on(table.finalScore),
  index("idx_tweet_analytics_should_reply").on(table.shouldReply),
  index("idx_tweet_analytics_computed_at").on(table.computedAtUtc),
]);

export const tweetReplies = pgTable("tweet_replies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tweetId: integer('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  reply: text("reply"),
  reasoning: text("reasoning"),
  
  /** Reply workflow state (moved from tweets table) */
  status: tweetReplyStatusEnum("status").notNull().default("pending"),
  errors: jsonb("errors").$type<string[]>().default([]),
  
  createdAtUtc: timestamp("created_at_utc", { withTimezone: true }).defaultNow(),
  updatedAtUtc: timestamp("updated_at_utc", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_tweet_replies_tweet_id").on(table.tweetId),
  index("idx_tweet_replies_status").on(table.status),
  index("idx_tweet_replies_updated").on(table.updatedAtUtc),
]);

export const tweetMedia = pgTable("tweet_media", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tweetId: integer('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  url: text("url").notNull(),
  type: tweetMediaTypeEnum("type").notNull(),
  description: text("description"),
  capturedAtUtc: timestamp("captured_at_utc", { withTimezone: true }).defaultNow(),
  updatedAtUtc: timestamp("updated_at_utc", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_tweet_media_tweet_id").on(table.tweetId),
  // Unique constraint to prevent duplicate media for the same tweet
  uniqueIndex("idx_tweet_media_unique").on(table.tweetId, table.url),
]);

// Define relations
export const tweetsRelations = relations(tweets, ({ many, one }) => ({
  media: many(tweetMedia),
  replies: many(tweetReplies),
  analytics: one(tweetAnalytics),
}));

export const tweetMediaRelations = relations(tweetMedia, ({ one }) => ({
  tweet: one(tweets, {
    fields: [tweetMedia.tweetId],
    references: [tweets.id],
  }),
}));

export const tweetRepliesRelations = relations(tweetReplies, ({ one }) => ({
  tweet: one(tweets, {
    fields: [tweetReplies.tweetId],
    references: [tweets.id],
  }),
}));

export const tweetAnalyticsRelations = relations(tweetAnalytics, ({ one }) => ({
  tweet: one(tweets, {
    fields: [tweetAnalytics.tweetId],
    references: [tweets.id],
  }),
}));


// Schema validation
export const tweetSelectSchema = createSelectSchema(tweets);
export const tweetInsertSchema = createInsertSchema(tweets);
export const tweetAnalyticsSelectSchema = createSelectSchema(tweetAnalytics);
export const tweetAnalyticsInsertSchema = createInsertSchema(tweetAnalytics);
export const tweetRepliesSelectSchema = createSelectSchema(tweetReplies);
export const tweetRepliesInsertSchema = createInsertSchema(tweetReplies);
export const tweetMediaSelectSchema = createSelectSchema(tweetMedia);
export const tweetMediaInsertSchema = createInsertSchema(tweetMedia);

// NEW UNIFIED TYPES
export type Tweet = typeof tweets.$inferSelect;
export type InsertTweet = typeof tweets.$inferInsert;
export type TweetAnalytics = typeof tweetAnalytics.$inferSelect;
export type InsertTweetAnalytics = typeof tweetAnalytics.$inferInsert;
export type TweetReply = typeof tweetReplies.$inferSelect;
export type InsertTweetReply = typeof tweetReplies.$inferInsert;
export type TweetMedia = typeof tweetMedia.$inferSelect;
export type InsertTweetMedia = typeof tweetMedia.$inferInsert;

// Type for media data before linking to tweet (no tweetId yet)
export type InsertTweetMediaWithoutTweetId = Omit<InsertTweetMedia, 'tweetId'>;

// Type for tweet data before insertion to DB (no tweetId in media yet)
export type InsertTweetWithMedia = InsertTweet & {
  media: InsertTweetMediaWithoutTweetId[];
};

// Type for ParsedTweet after it's been saved to DB (includes database ID and full media objects)
export type TweetWithMedia = Tweet & {
  media: TweetMedia[];
};