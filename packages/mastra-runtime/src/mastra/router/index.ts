import { createOpenRouter, OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import { createLogger } from '@vibeflow/logging';

const log = createLogger({ 
    context: 'cli', 
    name: 'mastra'
});

// Configuration interface for runtime initialization
export interface OpenRouterConfig {
    apiKey: string;
    baseURL?: string;
}

// Singleton instance management
class OpenRouterSingleton {
    private static instances: Map<string, OpenRouterProvider> = new Map();
    
    static getInstance(config: OpenRouterConfig): OpenRouterProvider {
        // Create a cache key based on config to support different configurations
        const cacheKey = `${config.apiKey}-${config.baseURL || 'default'}`;
        
        if (!this.instances.has(cacheKey)) {
            log.info("🔧 Initializing new OpenRouter provider instance...");
            
            if (!config.apiKey) {
                throw new Error("OpenRouter API key is required for initialization");
            }
            
            const openRouterInstance = createOpenRouter({
                apiKey: config.apiKey,
                baseURL: config.baseURL || "https://openrouter.ai/api/v1",
            });
            
            this.instances.set(cacheKey, openRouterInstance);
            log.info("✅ OpenRouter provider initialized successfully");
        } 
        
        return this.instances.get(cacheKey)!;
    }
    
    // Method to clear instances (useful for testing)
    static clearInstances(): void {
        this.instances.clear();
        log.info("🧹 OpenRouter provider instances cleared");
    }
}

// Factory function that accepts runtime configuration and returns singleton instance
export function createOpenRouterProvider(config: OpenRouterConfig): OpenRouterProvider {
    return OpenRouterSingleton.getInstance(config);
}

// Default singleton instance for most common use case
export function getDefaultOpenRouterProvider(): OpenRouterProvider {
    const defaultConfig: OpenRouterConfig = {
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: "https://openrouter.ai/api/v1"
    };
    
    if (!defaultConfig.apiKey) {
        throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
    
    return OpenRouterSingleton.getInstance(defaultConfig);
}

// Export for testing purposes
export { OpenRouterSingleton };