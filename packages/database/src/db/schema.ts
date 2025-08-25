import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  decimal, 
  jsonb,
  pgEnum
} from "drizzle-orm/pg-core";

// Status enum for tweet processing pipeline
export const tweetStatusEnum = pgEnum('tweet_status', [
  'pending',     // Just collected, not processed yet
  'processed',   // Analyzed and scored
  'notified',    // Sent to Slack/alerts
  'ready_to_respond',    // Older tweets moved to archive status
  'responded',      // Below threshold, kept for analysis,
  'ignored'      // Below threshold, kept for analysis,
]);

// Main table for processed tweets (your "hits")
export const tweetsTable = pgTable("tweets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  
  // Core tweet identifiers
  runId: varchar('run_id', { length: 255 }).notNull(),
  tweetId: varchar('tweet_id', { length: 255 }).notNull().unique(),
  tweetUrl: text('tweet_url').notNull(),
  
  // Author information (flattened for queries)
  authorUsername: varchar('author_username', { length: 255 }).notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorFollowers: integer('author_followers').default(0),
  
  // Tweet content and metadata
  text: text().notNull(),
  language: varchar({ length: 10 }).default('en'),
  createdAtUtc: timestamp('created_at_utc').notNull(),
  capturedAtUtc: timestamp('captured_at_utc').defaultNow().notNull(),
  
  // Processing results
  reason: text().notNull(), // Why this tweet was flagged
  explicitTerms: jsonb('explicit_terms').$type<string[]>().default([]),

  // Status tracking (your requested addition)
  status: tweetStatusEnum().default('pending').notNull(),
  
  // Optional fields
  mediaUrls: jsonb('media_urls').$type<string[]>().default([]),
  imageExplanations: jsonb('image_explanations').$type<string[]>().default([]),
  slackTs: varchar('slack_ts', { length: 255 }), // Slack message timestamp
  errors: jsonb('errors').$type<string[]>().default([]),
  
  // Indexing and search
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});