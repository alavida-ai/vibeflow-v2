ALTER TABLE "tweet_analytics" ALTER COLUMN "raw_engagement_score" SET DATA TYPE numeric(10, 3);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "raw_engagement_score" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "normalized_engagement_score" SET DATA TYPE numeric(10, 6);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "normalized_engagement_score" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "freshness_adjusted_score" SET DATA TYPE numeric(10, 6);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "freshness_adjusted_score" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "final_score" SET DATA TYPE numeric(10, 6);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "final_score" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "author_size_normalization_factor" SET DATA TYPE numeric(10, 6);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "author_size_normalization_factor" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "freshness_decay_factor" SET DATA TYPE numeric(10, 6);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "freshness_decay_factor" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "age_in_hours" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "tweet_analytics" ALTER COLUMN "age_in_hours" SET DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "tweet_analytics" ADD CONSTRAINT "tweet_analytics_tweet_id_unique" UNIQUE("tweet_id");