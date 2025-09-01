ALTER TABLE "tweet_media_analyzer" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tweet_media_analyzer" ALTER COLUMN "type" SET DEFAULT 'text'::text;--> statement-breakpoint
ALTER TABLE "tweets_analyzer" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tweets_analyzer" ALTER COLUMN "type" SET DEFAULT 'text'::text;--> statement-breakpoint
DROP TYPE "public"."tweet_media_type";--> statement-breakpoint
CREATE TYPE "public"."tweet_media_type" AS ENUM('text', 'photo', 'video');--> statement-breakpoint
ALTER TABLE "tweet_media_analyzer" ALTER COLUMN "type" SET DEFAULT 'text'::"public"."tweet_media_type";--> statement-breakpoint
ALTER TABLE "tweet_media_analyzer" ALTER COLUMN "type" SET DATA TYPE "public"."tweet_media_type" USING "type"::"public"."tweet_media_type";--> statement-breakpoint
ALTER TABLE "tweets_analyzer" ALTER COLUMN "type" SET DEFAULT 'text'::"public"."tweet_media_type";--> statement-breakpoint
ALTER TABLE "tweets_analyzer" ALTER COLUMN "type" SET DATA TYPE "public"."tweet_media_type" USING "type"::"public"."tweet_media_type";