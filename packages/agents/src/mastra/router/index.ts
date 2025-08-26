
import { createOpenRouter, OpenRouterProvider } from '@openrouter/ai-sdk-provider';

// Configuration interface for runtime initialization
export interface OpenRouterConfig {
    apiKey: string;
    baseURL?: string;
}

// Singleton MCP Client instance
let openRouterInstance: OpenRouterProvider | null = null;

// Factory function that accepts runtime configuration
export function createOpenRouterProvider(config: OpenRouterConfig): OpenRouterProvider {
    if (!openRouterInstance) {
        console.log("🔧 Initializing OpenRouter provider...");
        
        if (!config.apiKey) {
            throw new Error("OpenRouter API key is required for initialization");
        }
        
        openRouterInstance = createOpenRouter({
            apiKey: config.apiKey,
            baseURL: config.baseURL || "https://openrouter.ai/api/v1",
        });
        
        console.log("✅ OpenRouter provider initialized successfully");
    }
    return openRouterInstance;
}

// Legacy function for backward compatibility - throws error with guidance
export function getOpenRouter(): OpenRouterProvider {
    throw new Error(`
❌ getOpenRouter() cannot be used in monorepo context.
🔧 Use createOpenRouterProvider(config) instead:

import { createOpenRouterProvider } from '@brand-listener/agents';

const provider = createOpenRouterProvider({
    apiKey: process.env.OPENROUTER_API_KEY!
});
`);
}
