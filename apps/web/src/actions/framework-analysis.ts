'use server'

import { auth } from '@clerk/nextjs/server'
import { mastraClient } from '@/lib/mastra-client'

export async function analyzeTwitterUser(username: string) {
    // Clerk auth protection
    const { userId } = await auth()
    if (!userId) {
        throw new Error('Unauthorized')
    }

    const workflow = mastraClient.getWorkflow('twitterFrameworkAnalysisWorkflow');
    
    const stream = await workflow.stream({ inputData: { username } });

    return stream
}