import { pgTable, text, integer, timestamp, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const tweetsAnalyzer = pgTable('tweets_analyzer', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  apiId: text('api_id').notNull().unique(),
  url: text('url').notNull(),
  text: text('text').notNull(),
  retweetCount: integer('retweet_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  quoteCount: integer('quote_count').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  bookmarkCount: integer('bookmark_count').notNull().default(0),
  username: text('username').notNull(),
  createdAt: timestamp('created_at').notNull(),
  evs: real('evs').notNull().default(0),
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
  status: text('status').notNull().default('scraped'),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const tweetAnalyzerSelectSchema = createSelectSchema(tweetsAnalyzer);
export const tweetAnalyzerInsertSchema = createInsertSchema(tweetsAnalyzer);

export const tweetMediaAnalyzer = pgTable('tweet_media_analyzer', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  tweetId: integer('tweet_id').notNull().references(() => tweetsAnalyzer.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const tweetMediaAnalyzerSelectSchema = createSelectSchema(tweetMediaAnalyzer);
export const tweetMediaAnalyzerInsertSchema = createInsertSchema(tweetMediaAnalyzer);

// Define relations
export const tweetsRelations = relations(tweetsAnalyzer, ({ many }) => ({
  media: many(tweetMediaAnalyzer),
}));

export const tweetMediaRelations = relations(tweetMediaAnalyzer, ({ one }) => ({
  tweet: one(tweetsAnalyzer, {
    fields: [tweetMediaAnalyzer.tweetId],
    references: [tweetsAnalyzer.id],
  }),
}));

export type TweetAnalyzer = typeof tweetsAnalyzer.$inferSelect;
export type InsertTweetAnalyzer = typeof tweetsAnalyzer.$inferInsert;
export type TweetMediaAnalyzer = typeof tweetMediaAnalyzer.$inferSelect;
export type InsertTweetMediaAnalyzer = typeof tweetMediaAnalyzer.$inferInsert;

// Type for media data before linking to tweet (no tweetId yet)
export type InsertTweetMediaWithoutTweetId = Omit<InsertTweetMediaAnalyzer, 'tweetId'>;

// Type for tweet data before insertion to DB (no tweetId in media yet)
export type InsertTweetAnalyzerWithMedia = InsertTweetAnalyzer & {
  media: InsertTweetMediaWithoutTweetId[];
};

// Type for ParsedTweet after it's been saved to DB (includes database ID and full media objects)
export type SavedTweetAnalyzer = TweetAnalyzer & {
  media: TweetMediaAnalyzer[];
};