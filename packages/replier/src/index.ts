import { VibeflowAgentClient } from '@vibeflow/agent-sdk';
import * as TwitterDatabaseService from '@vibeflow/core';  
import { schema } from '@vibeflow/database';

const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";

interface ParsedAgentResponse {
    response: string;
    reasoning: string;
}

function parseAgentResponse(rawResponse: string): ParsedAgentResponse {
    // Extract content between <response> tags
    const responseMatch = rawResponse.match(/<response>([\s\S]*?)<\/response>/);
    const response = responseMatch ? responseMatch[1].trim() : '';
    
    // Extract content between <reasoning> tags
    const reasoningMatch = rawResponse.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';
    
    return {
        response,
        reasoning
    };
}

export async function replyToTweet({
    tweet
}: {
    tweet: schema.Tweet
}) : Promise<schema.Tweet> {
    try {
        const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
        console.log("Creating reply guy agent");
        const replyGuyAgent  = await vibeflowAgentClient.createMastraAgent("reply-guy");
        console.log("Reply guy agent created");
        const { text } = await replyGuyAgent.generate({ messages: ["Reply to this tweet: " + tweet.text] });
        console.log("Text generated");
        if (!text) {
            throw new Error("No response from agent");
        }
        const parsedTags = parseAgentResponse(text);
        const updatedTweet = await TwitterDatabaseService.addReplyToTweet(
            tweet.tweetId,
            parsedTags.response,
            parsedTags.reasoning
        );
        return updatedTweet;
    } catch (error) {
        console.error("Error replying to tweet", error);
        await TwitterDatabaseService.addErrorToTweet(
            tweet.tweetId,
            error instanceof Error ? error.message : String(error)
        );
        throw error;
    }
}

export async function batchReplyToTweets({
    tweets,
}: {
    tweets: schema.Tweet[];
}) : Promise<schema.Tweet[]> {
    return Promise.all(
        tweets.map((tweet) => replyToTweet({ tweet }))
    );
}