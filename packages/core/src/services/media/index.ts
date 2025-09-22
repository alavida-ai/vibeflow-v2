import { schema } from "@vibeflow/database";
import { generateVisualDescription } from "@vibeflow/media-utils";
import { updateMediaDescriptions } from "../database/twitter-service";

export async function batchProcessMediaDescriptions(mediaItems: schema.TweetMedia[]) {
    // Process all media descriptions in parallel with error handling
    const results = await Promise.allSettled(
        mediaItems.map(async (media: any) => {
            try {
                const description = await generateVisualDescription(media.type, media.url);
                media.description = description;
                media.updatedAt = new Date();
                await updateMediaDescriptions(media);
                return true;
            } catch (error) {
                console.error(`❌ Failed to process media ${media.id}:`, error);
                return false;
            }
        })
    );

    const mediaProcessed = results.filter(
        (result: any) => result.status === 'fulfilled' && result.value === true
    ).length;

    return mediaProcessed;
}