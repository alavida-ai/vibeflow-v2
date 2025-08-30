import { ingestUserLastTweets } from "@brand-listener/ingestion";
import { config } from "dotenv";
import { AnalyzerService } from "@brand-listener/core/services/database";
import { generateVisualDescription } from "@brand-listener/core/services/media-files";

config();

export async function main() {

    if (!process.env.TWITTER_USERNAME) {
        throw new Error("TWITTER_USERNAME is not set");
    }

    if (!process.env.TWITTER_API_KEY) {
        throw new Error("TWITTER_API_KEY is not set");
    }

    console.log("Starting ingestion");

    const userName = process.env.TWITTER_USERNAME

    const lastTweets = await ingestUserLastTweets({
        userName
    });

    console.log("Ingestion complete we have " + lastTweets.totalTweets + " tweets");

    const mediaItems = await AnalyzerService.getMediaByAuthorUsername(userName);

    for (const media of mediaItems) {
        const description = await generateVisualDescription(media.type, media.url);
        media.description = description;
        await AnalyzerService.updateMediaDescriptions(media);
    }

    console.log("Media descriptions generated");
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