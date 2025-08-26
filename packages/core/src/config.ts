import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import type { Config } from './types/config';

export async function loadConfig(configPath: string = 'config.yaml'): Promise<Config> {
  try {
    const configFile = await readFile(configPath, 'utf8');
    const config = parse(configFile) as Config;
    
    validateConfig(config);
    return config;
  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${error}`);
  }
}

function validateConfig(config: Config): void {
  if (!config.brand?.handles?.length) {
    throw new Error('Config must include brand.handles array');
  }
  
  if (!config.brand?.keywords?.length) {
    throw new Error('Config must include brand.keywords array');
  }
  
  if (!config.notify?.slack_channel) {
    throw new Error('Config must include notify.slack_channel');
  }

}

export function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value || '';
}

export function validateEnvVars(): void {
  getEnvVar('TWITTER_API_KEY');
  getEnvVar('SLACK_WEBHOOK_URL');
}
