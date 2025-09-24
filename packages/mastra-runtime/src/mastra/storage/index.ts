import { PostgresStore } from "@mastra/pg";

// Singleton instance to avoid duplicate connections
let _storage: PostgresStore | null = null;

export const createStorage = () => {
    if (_storage) return _storage;
    
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    _storage = new PostgresStore({
        connectionString: process.env.DATABASE_URL!,
    });
    
    return _storage;
}

// Export shared instance for reuse
export const getSharedStorage = () => {
    return createStorage();
}   
