import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  jsonb,
  boolean,
  pgEnum,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
// Status enum for tweet processing pipeline
/** Tweet processing pipeline statuses */
export const tweetStatusEnumSchema = z.enum([
  "pending",            // collected, not processed
  "processed",          // normalized/validated
  "notified",           // pushed to Slack/alerts
  "ready_to_respond",   // queued for human approval/agent pass
  "responded",          // reply posted
  "ignored",            // intentionally not engaging
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
]);

export const tweetSelectSchema = createSelectSchema(tweetsTable);
export const tweetInsertSchema = createInsertSchema(tweetsTable);

export type Tweet = typeof tweetsTable.$inferSelect;
export type InsertTweet = typeof tweetsTable.$inferInsert;