ALTER TABLE "tweets" ALTER COLUMN "created_at_utc" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "captured_at_utc" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "captured_at_utc" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "updated_at" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "tweets" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tweets" DROP COLUMN "reason";--> statement-breakpoint
ALTER TABLE "tweets" DROP COLUMN "explicit_terms";--> statement-breakpoint
ALTER TABLE "tweets" DROP COLUMN "media_urls";--> statement-breakpoint
ALTER TABLE "tweets" DROP COLUMN "image_explanations";--> statement-breakpoint
ALTER TABLE "tweets" DROP COLUMN "slack_ts";