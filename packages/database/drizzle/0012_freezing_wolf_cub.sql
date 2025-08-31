CREATE TYPE "public"."tweet_media_type" AS ENUM('text', 'image', 'video');--> statement-breakpoint
ALTER TABLE "tweet_media_analyzer" ALTER COLUMN "type" SET DEFAULT 'text'::"public"."tweet_media_type";--> statement-breakpoint
ALTER TABLE "tweet_media_analyzer" ALTER COLUMN "type" SET DATA TYPE "public"."tweet_media_type" USING "type"::"public"."tweet_media_type";--> statement-breakpoint
ALTER TABLE "tweets_analyzer" ADD COLUMN "type" "tweet_media_type" DEFAULT 'text' NOT NULL;