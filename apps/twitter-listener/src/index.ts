import { ingestMentions, batchCheckResponseStatus } from "@brand-listener/ingestion";
import * as AnalyticsService from "@brand-listener/core/services/analytics";
import * as TwitterDatabaseService from "@brand-listener/core/services/database";
import { batchReplyToTweets } from "@brand-listener/replier";
import { createReplyGuyAgent } from "@brand-listener/agents";
import { config } from "dotenv";

config();

export async function main() {

    if (!process.env.TWITTER_USERNAME) {
        throw new Error("TWITTER_USERNAME is not set");
    }

    const replyGuyAgent = createReplyGuyAgent({
        openRouter: {
            apiKey: process.env.OPENROUTER_API_KEY!,
            baseURL: "https://openrouter.ai/api/v1"
        }
    });

    console.log("Starting ingestion");
    const mentions = await ingestMentions({
        userName: process.env.TWITTER_USERNAME,
        sinceTime: new Date("2025-08-27"),
    });
    console.log("Ingestion complete we have " + mentions.totalTweets + " tweets");

    const pendingTweets = await TwitterDatabaseService.getPendingTweets();
    console.log("We have " + pendingTweets.length + " pending tweets");
    
    if (pendingTweets.length > 0) {
        const analytics = await AnalyticsService.calculateBatchTweetAnalytics(pendingTweets); // Need to figure out how to update the analytics in the database
        console.log("We have " + analytics.length + " analytics");
    
        await TwitterDatabaseService.batchAddAnalyticsToTweets(analytics);
        console.log("Batch analytics complete");
    }

    // Fetch tweet candidates with engagement score > 5 and not replies
    const candidates = await TwitterDatabaseService.getTweetCandidates();
    console.log("We have " + candidates.length + " tweet candidates");
    
    // Log some details about the candidates
    if (candidates.length > 0) {
        console.log("Sample candidate:");
        const sample = candidates[0];
        console.log(`- Tweet ID: ${sample.tweet.tweetId}`);
        console.log(`- Text: ${sample.tweet.text.substring(0, 100)}...`);
        console.log(`- Engagement Score: ${sample.analytics.finalScore}`);
        console.log(`- Author: @${sample.tweet.authorUsername}`);
        console.log(`- Is Reply: ${sample.tweet.isReply}`);
    } 

    // Check if the user has replied to the tweet
    const { respondedTweets, nonRespondedTweets, totalChecked, responseRate } = await batchCheckResponseStatus(candidates);
    console.log("Responded tweets: " + respondedTweets.length);
    console.log("Non responded tweets: " + nonRespondedTweets.length);
    console.log("Total checked: " + totalChecked);
    console.log("Response rate: " + responseRate);

    const tweetsToReply = candidates.filter(c => nonRespondedTweets.includes(c.tweet.tweetId));
    console.log("We have " + tweetsToReply.length + " tweets to reply to");


    const replies = await batchReplyToTweets({
        tweets: tweetsToReply.map(t => t.tweet),
        replyGuyAgent
    });
    for (const reply of replies) {
        console.log("Replied to tweet: " + reply.tweetId + " with reply: " + reply.reply + " and reasoning: " + reply.reasoning + "\n");
    }
}

main();