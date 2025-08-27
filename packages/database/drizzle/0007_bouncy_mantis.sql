ALTER TYPE "public"."tweet_status" ADD VALUE 'error';--> statement-breakpoint
CREATE TABLE "tweet_analytics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tweet_analytics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tweet_id" varchar(64) NOT NULL,
	"raw_engagement_score" integer DEFAULT 0 NOT NULL,
	"normalized_engagement_score" integer DEFAULT 0 NOT NULL,
	"freshness_adjusted_score" integer DEFAULT 0 NOT NULL,
	"final_score" integer DEFAULT 0 NOT NULL,
	"author_size_normalization_factor" integer NOT NULL,
	"freshness_decay_factor" integer NOT NULL,
	"age_in_hours" integer NOT NULL,
	"should_reply" boolean DEFAULT false NOT NULL,
	"algorithm_version" varchar(16) DEFAULT '1.0' NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_tweet_id" ON "tweet_analytics" USING btree ("tweet_id");--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_final_score" ON "tweet_analytics" USING btree ("final_score");--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_should_reply" ON "tweet_analytics" USING btree ("should_reply");--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_computed_at" ON "tweet_analytics" USING btree ("computed_at");--> statement-breakpoint
CREATE INDEX "idx_tweets_created_status" ON "tweets" USING btree ("created_at_utc","status");--> statement-breakpoint
CREATE INDEX "idx_tweets_captured_time" ON "tweets" USING btree ("captured_at_utc");--> statement-breakpoint
CREATE INDEX "idx_tweets_author_status_updated" ON "tweets" USING btree ("author_id","status","updated_at");--> statement-breakpoint
CREATE INDEX "idx_tweets_language" ON "tweets" USING btree ("lang");--> statement-breakpoint
CREATE INDEX "idx_tweets_status" ON "tweets" USING btree ("status");