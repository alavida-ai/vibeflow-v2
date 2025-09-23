import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { batchProcessMediaDescriptions, getMediaPendingDescriptionByTweetIds } from '@vibeflow/core';

export const generateTweetMediaDescriptionsTool: ReturnType<typeof createTool> = createTool({
    id: 'generate-tweet-media-descriptions',
    description: `Generate media descriptions for tweets.`,
    inputSchema: z.object({
        tweetIds: z.array(z.number()).describe('Tweet IDs to generate media descriptions for'),
    }),
    outputSchema: z.object({
        mediaProcessed: z.number().describe('The number of media items processed')
    }),
    execute: async ({ context }) => {
        try {
            const mediaItems = await getMediaPendingDescriptionByTweetIds(context.tweetIds);

            if (mediaItems.length === 0) {
                return {
                    mediaProcessed: 0
                };
            }

            const mediaProcessed = await batchProcessMediaDescriptions(mediaItems);

            return {
                mediaProcessed: mediaProcessed
            };
        } catch (error) {
            throw new Error(`Failed to analyze tweets: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
});