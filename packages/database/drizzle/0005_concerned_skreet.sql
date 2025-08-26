ALTER TABLE "tweets" ALTER COLUMN "tweet_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "author_username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "author_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "created_at_utc" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "captured_at_utc" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "captured_at_utc" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "lang" varchar(10);--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "author_id" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "conversation_id" varchar(64);--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "is_reply" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "in_reply_to_id" varchar(64);--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "in_reply_to_username" varchar(255);--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "reply_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "retweet_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "quote_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "source" varchar(32) DEFAULT 'mentions' NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "raw_json" jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_tweets_tweet_id" ON "tweets" USING btree ("tweet_id");--> statement-breakpoint
ALTER TABLE "tweets" DROP COLUMN "language";