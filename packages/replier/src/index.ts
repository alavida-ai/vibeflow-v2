import { createReplyGuyAgent } from '@brand-listener/agents';
import { TwitterDatabaseService } from '@brand-listener/core';  
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

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

async function main() {
    const pendingTweets = await TwitterDatabaseService.getPendingTweets();
    console.log("Starting replier with " + pendingTweets.length + " pending tweets");

    const tweetToReply = pendingTweets[0];
    const {reply, reasoning} = await replyToTweet(tweetToReply.text);
    const updatedTweet = await TwitterDatabaseService.addReplyToTweet(tweetToReply.tweetId, reply, reasoning);

    console.log("Replied to tweet " + updatedTweet.tweetId + " with reply: " + updatedTweet.reply + " and reasoning: " + updatedTweet.reasoning);

    // // Create the agent with runtime configuration
    // const replyGuyAgent = createReplyGuyAgent({
    //     openRouter: {
    //         apiKey: process.env.OPENROUTER_API_KEY!,
    //         baseURL: "https://openrouter.ai/api/v1"
    //     }
    // });

    // const tweet = `
    //     @Send @ethentree @xino_it @send_africa @muniwtr @Callmeblackbot @base @USDC @usdcoinprinter @usdc_cool It's not just about storing money, it's about making it work for you in a borderless and digital-first economy.

    //     Let's save it on https://t.co/FSzuo8Lam1 now.

    //     $SEND $USDC 

    //     @Send @ethentree
    //     @send_africa @xino_it 
    //     @StrongMind0 @zeroxBigBoss 
    //     @USDC @TheRealKrayo
    // `;

    // const rawResponse = await replyGuyAgent.generate("Reply to this tweet: " + tweet);
    // console.log(rawResponse);
}

export async function replyToTweet(tweet: string) {
    const replyGuyAgent = createReplyGuyAgent({
        openRouter: {
            apiKey: process.env.OPENROUTER_API_KEY!,
            baseURL: "https://openrouter.ai/api/v1"
        }
    });

    const {text} = await replyGuyAgent.generate("Reply to this tweet: " + tweet);
    if (!text) {
        throw new Error("No response from agent");
    }
    const parsedTags = parseAgentResponse(text);
    
    return {
        reply: parsedTags.response,
        reasoning: parsedTags.reasoning
    };
}

main();