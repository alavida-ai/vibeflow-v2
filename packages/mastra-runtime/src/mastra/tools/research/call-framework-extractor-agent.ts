import { GPT_4O } from "../../constants";
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createOpenRouterProvider } from "../../router";

const router = createOpenRouterProvider({
    apiKey: process.env.OPENROUTER_API_KEY!
});

const frameworksSchema = z.array(z.object({
    title: z.string(),
    description: z.string(),
    structure: z.string().describe('The structure of the framework'),
    promptTemplate: z.string().describe('The template for using this framework'),
    tweetIds: z.array(z.string()).describe('The tweet IDs that demonstrate this framework')
}));

export const callFrameworkExtractorAgentTool: ReturnType<typeof createTool> = createTool({
    id: 'call-framework-extractor-agent',
    description: `Call the framework extractor agent to extract frameworks from tweets.`,
    inputSchema: z.object({
        tweets: z.array(z.any())
    }),
    outputSchema: z.object({
        frameworks: frameworksSchema
    }),
    execute: async ({ context, runId }) => {
        try {
            const { tweets } = context;
            const { mastra, logger, runtimeContext } = context.agents;

            const frameworkAgent = mastra.getAgent("frameworkAgent");
            logger.debug('Framework agent retrieved', { runId, agentName: "frameworkAgent" });

            const tweetsData = JSON.stringify(tweets, null, 2);
            const prompt = `Analyze the tweets below and identify their content frameworks. 

IMPORTANT: For each framework you extract, you MUST include the specific tweet IDs that demonstrate this framework. Reference the tweets by their ID from the data provided.

Format your response to clearly show:
1. Framework title and description
2. Framework structure/pattern
3. Prompt template for using this framework
4. Tweet IDs that demonstrate this framework

Tweets data:
${tweetsData}`;

            let result;
            try {
                logger.info('Calling framework agent generate method', { runId });

                result = await frameworkAgent.generate(prompt, {
                    memory: {
                        thread: {
                            id: runtimeContext.get("threadId"),
                        },
                        resource: runtimeContext.get("resourceId")
                    },
                    structuredOutput: {
                        schema: z.object({
                            frameworksSchema
                        }),
                        model: router(GPT_4O),
                        errorStrategy: 'warn',
                    },
                });

                logger.info('Framework agent completed successfully', { runId });

                return {
                    frameworks: result.text ? [result.text] : []
                };
            } catch (agentError) {
                logger.error('Framework agent execution failed', { runId, error: agentError });
                throw agentError;
            }
        } catch (error) {
            throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
});