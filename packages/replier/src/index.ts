import { createReplyGuyAgent } from '@brand-listener/agents';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function main() {
    console.log("Starting replier");

    // Create the agent with runtime configuration
    const replyGuyAgent = createReplyGuyAgent({
        openRouter: {
            apiKey: process.env.OPENROUTER_API_KEY!,
            baseURL: "https://openrouter.ai/api/v1"
        }
    });

    const tweet = `
        @Send @ethentree @xino_it @send_africa @muniwtr @Callmeblackbot @base @USDC @usdcoinprinter @usdc_cool It's not just about storing money, it's about making it work for you in a borderless and digital-first economy.

        Let's save it on https://t.co/FSzuo8Lam1 now.

        $SEND $USDC 

        @Send @ethentree
        @send_africa @xino_it 
        @StrongMind0 @zeroxBigBoss 
        @USDC @TheRealKrayo
    `;

    const rawResponse = await replyGuyAgent.generate("Reply to this tweet: " + tweet);
    console.log(rawResponse);
}

main();