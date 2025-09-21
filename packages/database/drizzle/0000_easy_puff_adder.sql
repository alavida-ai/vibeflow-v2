CREATE TYPE "public"."tweet_media_type" AS ENUM('photo', 'video', 'animated_gif');--> statement-breakpoint
CREATE TYPE "public"."tweet_reply_status" AS ENUM('pending', 'processed', 'notified', 'ready_to_respond', 'responded', 'ignored', 'error');--> statement-breakpoint
CREATE TYPE "public"."tweet_source" AS ENUM('user-mentions', 'tweet-replies', 'user-last-tweets');--> statement-breakpoint
CREATE TABLE "tweet_analytics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tweet_analytics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tweet_id" integer NOT NULL,
	"raw_engagement_score" numeric(10, 3) DEFAULT '0.0' NOT NULL,
	"normalized_engagement_score" numeric(10, 6) DEFAULT '0.0' NOT NULL,
	"freshness_adjusted_score" numeric(10, 6) DEFAULT '0.0' NOT NULL,
	"final_score" numeric(10, 6) DEFAULT '0.0' NOT NULL,
	"author_size_normalization_factor" numeric(10, 6) DEFAULT '0.0' NOT NULL,
	"freshness_decay_factor" numeric(10, 6) DEFAULT '0.0' NOT NULL,
	"age_in_hours" numeric(10, 2) DEFAULT '0.0' NOT NULL,
	"should_reply" boolean DEFAULT false NOT NULL,
	"algorithm_version" varchar(16) DEFAULT '1.0' NOT NULL,
	"computed_at_utc" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tweet_media" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tweet_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tweet_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" "tweet_media_type" NOT NULL,
	"description" text,
	"captured_at_utc" timestamp with time zone DEFAULT now(),
	"updated_at_utc" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tweet_replies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tweet_replies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tweet_id" integer NOT NULL,
	"reply" text,
	"reasoning" text,
	"status" "tweet_reply_status" DEFAULT 'pending' NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb,
	"created_at_utc" timestamp with time zone DEFAULT now(),
	"updated_at_utc" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tweets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tweets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"api_id" varchar(64) NOT NULL,
	"text" text NOT NULL,
	"lang" varchar(10),
	"url" text NOT NULL,
	"author_id" varchar(64) NOT NULL,
	"author_username" varchar(255),
	"author_name" varchar(255),
	"author_followers" integer DEFAULT 0,
	"conversation_id" varchar(64),
	"is_reply" boolean DEFAULT false NOT NULL,
	"in_reply_to_id" varchar(64),
	"in_reply_to_username" varchar(255),
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"retweet_count" integer DEFAULT 0 NOT NULL,
	"quote_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"bookmark_count" integer DEFAULT 0 NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL,
	"captured_at_utc" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at_utc" timestamp with time zone DEFAULT now() NOT NULL,
	"source" "tweet_source" DEFAULT 'user-mentions' NOT NULL,
	"raw_json" jsonb NOT NULL,
	CONSTRAINT "tweets_api_id_unique" UNIQUE("api_id")
);
--> statement-breakpoint
ALTER TABLE "tweet_analytics" ADD CONSTRAINT "tweet_analytics_tweet_id_tweets_id_fk" FOREIGN KEY ("tweet_id") REFERENCES "public"."tweets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tweet_media" ADD CONSTRAINT "tweet_media_tweet_id_tweets_id_fk" FOREIGN KEY ("tweet_id") REFERENCES "public"."tweets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tweet_replies" ADD CONSTRAINT "tweet_replies_tweet_id_tweets_id_fk" FOREIGN KEY ("tweet_id") REFERENCES "public"."tweets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_tweet_id" ON "tweet_analytics" USING btree ("tweet_id");--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_final_score" ON "tweet_analytics" USING btree ("final_score");--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_should_reply" ON "tweet_analytics" USING btree ("should_reply");--> statement-breakpoint
CREATE INDEX "idx_tweet_analytics_computed_at" ON "tweet_analytics" USING btree ("computed_at_utc");--> statement-breakpoint
CREATE INDEX "idx_tweet_media_tweet_id" ON "tweet_media" USING btree ("tweet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tweet_media_unique" ON "tweet_media" USING btree ("tweet_id","url");--> statement-breakpoint
CREATE INDEX "idx_tweet_replies_tweet_id" ON "tweet_replies" USING btree ("tweet_id");--> statement-breakpoint
CREATE INDEX "idx_tweet_replies_status" ON "tweet_replies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tweet_replies_updated" ON "tweet_replies" USING btree ("updated_at_utc");--> statement-breakpoint
CREATE INDEX "idx_tweets_api_id" ON "tweets" USING btree ("api_id");--> statement-breakpoint
CREATE INDEX "idx_tweets_created_time" ON "tweets" USING btree ("created_at_utc");--> statement-breakpoint
CREATE INDEX "idx_tweets_captured_time" ON "tweets" USING btree ("captured_at_utc");--> statement-breakpoint
CREATE INDEX "idx_tweets_author_updated" ON "tweets" USING btree ("author_id","updated_at_utc");--> statement-breakpoint
CREATE INDEX "idx_tweets_language" ON "tweets" USING btree ("lang");--> statement-breakpoint
CREATE INDEX "idx_tweets_source" ON "tweets" USING btree ("source");