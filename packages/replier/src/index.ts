import { type ReplyGuyAgent } from '@brand-listener/agents';
import * as TwitterDatabaseService from '@brand-listener/core/services/database';  
import { schema } from '@brand-listener/database';

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
    tweet,
    replyGuyAgent
}: {
    tweet: schema.Tweet;
    replyGuyAgent: ReplyGuyAgent;
}) : Promise<schema.Tweet> {
    try {
        const { text } = await replyGuyAgent.generate("Reply to this tweet: " + tweet.text);
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
    replyGuyAgent
}: {
    tweets: schema.Tweet[];
    replyGuyAgent: ReplyGuyAgent;
}) : Promise<schema.Tweet[]> {
    return Promise.all(
        tweets.map((tweet) => replyToTweet({ tweet, replyGuyAgent }))
    );
}