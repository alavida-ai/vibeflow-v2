import { ingestUserLastTweetsWithEnrichment } from "@brand-listener/ingestion";
import { config } from "dotenv";

config();

export async function main() {

    if (!process.env.TWITTER_USERNAME) {
        throw new Error("TWITTER_USERNAME is not set");
    }

    if (!process.env.TWITTER_API_KEY) {
        throw new Error("TWITTER_API_KEY is not set");
    }

    console.log("Starting complete ingestion pipeline");

    const userName = process.env.TWITTER_USERNAME

    const result = await ingestUserLastTweetsWithEnrichment({
        userName
    }, (media) => {
        console.log(`✅ Generated description for ${media.type}: ${media.url.substring(0, 50)}...`);
    });

    console.log(`🎉 Pipeline complete! ${result.totalTweets} tweets ingested, ${result.totalMediaDescriptions} media descriptions generated`);
}

main()
    .then(() => {
        console.log("✅ Main process finished");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Main process failed:", error);
        process.exit(1);
    });