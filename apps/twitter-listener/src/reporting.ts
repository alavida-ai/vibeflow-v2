import { getMostRelevantTweetsToReplyTo } from "@brand-listener/core/services/database";
import { SlackClient } from "@brand-listener/core/services/slack";
import { buildMostRelevantTweetsReport } from "@brand-listener/reporting";
import { type SlackMessagePayload } from "@brand-listener/core";
import { config } from "dotenv";

config();

export async function generateMostRelevantTweetsReport(topK: number): Promise<SlackMessagePayload> {
    const tweets = await getMostRelevantTweetsToReplyTo({ top_k: topK });
    const report = buildMostRelevantTweetsReport(tweets);
    console.log('Generated Slack Report:');
    console.log(JSON.stringify(report, null, 2));
    return report;
}

async function main() {
    if (!process.env.SLACK_WEBHOOK_URL) {
        throw new Error("SLACK_WEBHOOK_URL is not set");
    }

    if (!process.env.TOP_K) {
        throw new Error("TOP_K is not set");
    }

    const slackClient = new SlackClient(process.env.SLACK_WEBHOOK_URL!);
    const report = await generateMostRelevantTweetsReport(parseInt(process.env.TOP_K));
    await slackClient.postMessage(report);
    
    console.log("📊 Reports sent successfully");
}

main()
    .then(() => {
        console.log("✅ Reporting process finished");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Reporting process failed:", error);
        process.exit(1);
    });