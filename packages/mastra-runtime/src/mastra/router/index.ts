import { createOpenRouter, OpenRouterProvider } from '@openrouter/ai-sdk-provider';

// Configuration interface for runtime initialization
export interface OpenRouterConfig {
    apiKey: string;
    baseURL?: string;
}

// Factory function that accepts runtime configuration
export function createOpenRouterProvider(config: OpenRouterConfig): OpenRouterProvider {

        console.log("🔧 Initializing OpenRouter provider...");
        
        if (!config.apiKey) {
            throw new Error("OpenRouter API key is required for initialization");
        }
        
        const openRouterInstance = createOpenRouter({
            apiKey: config.apiKey,
            baseURL: config.baseURL || "https://openrouter.ai/api/v1",
        });
        
        console.log("✅ OpenRouter provider initialized successfully");
    return openRouterInstance;
}