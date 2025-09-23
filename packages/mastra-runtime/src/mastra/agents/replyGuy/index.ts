import { Agent } from '@mastra/core/agent';
import { PROMPT_GENERATE } from "./prompt";
import { createOpenRouterProvider, OpenRouterConfig } from '../../router';
import { CLAUDE_SONNET_4 } from '../../constants';
import { createLogger } from "@vibeflow/logging";

const logger = createLogger({
    context: "cli",
    name: "mastra-runtime"
});

// Agent configuration interface
export interface ReplyGuyAgentConfig {
    openRouter: OpenRouterConfig;
}

export type ReplyGuyAgent = Agent;

// Factory function for creating the reply guy agent at runtime
export function createReplyGuyAgent(config: ReplyGuyAgentConfig): Agent {
    logger.info('🚀 Creating Reply Guy Agent with runtime configuration...');
    
    // Create the OpenRouter provider with runtime config
    const openRouter = createOpenRouterProvider(config.openRouter);
    
    // Create and validate the model
    const model = openRouter(CLAUDE_SONNET_4);
    logger.info('🤖 Model created:', JSON.stringify(model ? 'SUCCESS' : 'FAILED', null, 2) as any);
    logger.info('🎯 Model ID:  CLAUDE_SONNET_4', JSON.stringify(CLAUDE_SONNET_4, null, 2) as any);
    
    const agent = new Agent({
        name: 'Reply Guy Twitter Agent',
        instructions: PROMPT_GENERATE,
        model: model,
        tools: {
            // getBrandFundamentalsTool, // TODO: Implement this tool
        },
    });
    
        logger.info('✅ Reply Guy Agent created successfully');
    return agent;
}

// Legacy export that throws helpful error
export const replyGuyAgent = new Proxy({} as Agent, {
    get() {
        throw new Error(`
❌ replyGuyAgent cannot be used directly in monorepo context.
🔧 Use createReplyGuyAgent(config) instead:

import { createReplyGuyAgent } from '@vibeflow/agents';

const agent = createReplyGuyAgent({
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY!
    }
});
`);
    }
});
