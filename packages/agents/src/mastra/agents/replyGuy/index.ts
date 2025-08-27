import { Agent } from '@mastra/core/agent';
import { PROMPT_GENERATE } from "./prompt";
import { createOpenRouterProvider, OpenRouterConfig } from '../../router';
import { CLAUDE_SONNET_4 } from '../../constants/';
import { getBrandFundamentalsTool } from '../../tools/get-context';

// Agent configuration interface
export interface ReplyGuyAgentConfig {
    openRouter: OpenRouterConfig;
}

export type ReplyGuyAgent = Agent;

// Factory function for creating the reply guy agent at runtime
export function createReplyGuyAgent(config: ReplyGuyAgentConfig): Agent {
    console.log('🚀 Creating Reply Guy Agent with runtime configuration...');
    
    // Create the OpenRouter provider with runtime config
    const openRouter = createOpenRouterProvider(config.openRouter);
    
    // Create and validate the model
    const model = openRouter(CLAUDE_SONNET_4);
    console.log('🤖 Model created:', model ? 'SUCCESS' : 'FAILED');
    console.log('🎯 Model ID:', CLAUDE_SONNET_4);
    
    const agent = new Agent({
        name: 'Reply Guy Twitter Agent',
        instructions: PROMPT_GENERATE,
        model: model,
        tools: {
            getBrandFundamentalsTool,
        },
    });
    
    console.log('✅ Reply Guy Agent created successfully');
    return agent;
}

// Legacy export that throws helpful error
export const replyGuyAgent = new Proxy({} as Agent, {
    get() {
        throw new Error(`
❌ replyGuyAgent cannot be used directly in monorepo context.
🔧 Use createReplyGuyAgent(config) instead:

import { createReplyGuyAgent } from '@brand-listener/agents';

const agent = createReplyGuyAgent({
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY!
    }
});
`);
    }
});
