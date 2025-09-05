import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';

interface EnvConfig {
  envDir?: string;
  nodeEnv?: string;
}

/**
 * Load environment variables following Next.js pattern
 * Loads in priority order: .env.{NODE_ENV}.local, .env.local, .env.{NODE_ENV}, .env
 */
export function loadEnvConfig(config: EnvConfig = {}): Record<string, string> {
  const { 
    envDir = process.cwd(), 
    nodeEnv = process.env.NODE_ENV || 'development' 
  } = config;

  // Define the loading order (same as Next.js)
  const envFiles = [
    `.env.${nodeEnv}.local`,
    '.env.local',
    `.env.${nodeEnv}`,
    '.env'
  ];

  const loadedVars: Record<string, string> = {};

  // Load each file in reverse order (so higher priority files override)
  for (const envFile of envFiles.reverse()) {
    const envPath = path.resolve(envDir, envFile);
    
    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const parsed = parse(envContent);
        
        // Only set variables that aren't already set (respects priority)
        for (const [key, value] of Object.entries(parsed)) {
          if (!(key in loadedVars) && !(key in process.env)) {
            loadedVars[key] = value;
            process.env[key] = value;
          }
        }
        
        console.log(`✓ Loaded environment variables from ${envFile}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not load ${envFile}:`, error);
    }
  }

  return loadedVars;
}

/**
 * Get the project root directory (where .env files should be located)
 */
export function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = startDir;
  
  // If we're running from a built version, we need to go up from the package directory
  // to find the workspace root
  while (currentDir !== path.dirname(currentDir)) {
    // Look for workspace root indicators first
    if (
      fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(currentDir, 'turbo.json'))
    ) {
        console.log("Found workspace root in", currentDir);
      return currentDir;
    }
    
    // Then look for package.json, but prefer workspace indicators
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        // If it has workspaces, this is likely the root
        if (packageJson.workspaces) {
          return currentDir;
        }
      } catch (error) {
        // Continue if we can't read package.json
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return startDir; // fallback to start directory
}

/**
 * Initialize environment loading (call this early in your app)
 */
export async function initEnv(config: EnvConfig = {}): Promise<void> {
  const projectRoot = findProjectRoot();
  const envConfig = { envDir: projectRoot, ...config };
  
  console.log(`🌍 Loading environment variables from: ${envConfig.envDir}`);
  console.log(`📁 Current working directory: ${process.cwd()}`);
  console.log(`🎯 Project root detected: ${projectRoot}`);
  
  const loadedVars = loadEnvConfig(envConfig);
  const loadedKeys = Object.keys(loadedVars);
  
  if (loadedKeys.length > 0) {
    console.log(`✅ Loaded ${loadedKeys.length} environment variables:`, loadedKeys.join(', '));
  } else {
    console.log(`⚠️ No environment variables were loaded. Make sure .env files exist in ${projectRoot}`);
  }
  
  // Specifically check for common required variables
  const requiredVars = ['OPENROUTER_API_KEY', 'DATABASE_URL', 'WORKFLOWS_DIR'];
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log(`🔴 Missing required environment variables: ${missing.join(', ')}`);
  } else {
    console.log(`🟢 All common environment variables are loaded`);
  }
}
