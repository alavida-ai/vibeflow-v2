import { getMostRelevantTweetsToReplyTo } from "@brand-listener/core/services/database";
import { SlackClient } from "@brand-listener/core/services/slack";
import { buildMostRelevantTweetsReport } from "@brand-listener/reporting";
import { type SlackMessagePayload } from "@brand-listener/core";
import dotenv from "dotenv";

dotenv.config();


export async function generateMostRelevantTweetsReport(): Promise<SlackMessagePayload> {
    const tweets = await getMostRelevantTweetsToReplyTo({ top_k: 5 });
    const report = buildMostRelevantTweetsReport(tweets);
    console.log('Generated Slack Report:');
    console.log(JSON.stringify(report, null, 2));
    return report;
}

async function main() {
    const slackClient = new SlackClient(process.env.SLACK_WEBHOOK_URL!);
    const report = await generateMostRelevantTweetsReport();
    await slackClient.postMessage(report);
}

main();