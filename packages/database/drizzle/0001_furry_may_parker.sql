CREATE TYPE "public"."tweet_status" AS ENUM('pending', 'processed', 'notified', 'ready_to_respond', 'responded', 'ignored');--> statement-breakpoint
CREATE TABLE "tweets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tweets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"run_id" varchar(255) NOT NULL,
	"tweet_id" varchar(255) NOT NULL,
	"tweet_url" text NOT NULL,
	"author_username" varchar(255) NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"author_followers" integer DEFAULT 0,
	"text" text NOT NULL,
	"language" varchar(10) DEFAULT 'en',
	"created_at_utc" timestamp NOT NULL,
	"captured_at_utc" timestamp DEFAULT now() NOT NULL,
	"reason" text NOT NULL,
	"explicit_terms" jsonb DEFAULT '[]'::jsonb,
	"status" "tweet_status" DEFAULT 'pending' NOT NULL,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"image_explanations" jsonb DEFAULT '[]'::jsonb,
	"slack_ts" varchar(255),
	"errors" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tweets_tweet_id_unique" UNIQUE("tweet_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'viewer' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "age";