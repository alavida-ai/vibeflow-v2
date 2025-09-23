import pino from "pino";
import chalk from "chalk";
import build from "pino-abstract-transport";

// Types for logger configuration
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'cli' | 'server';

export interface LoggerConfig {
  context: LogContext;
  name: string;
  level?: LogLevel;
  pkg?: string; // Package name for cross-package logging
}

// Custom CLI transport for colored output using pino-abstract-transport
export function createCliTransport(loggerName?: string) {
  return async function (opts: any) {
    return build(async function (source: any) {
      for await (const obj of source) {
        const { level, msg, name, time, ...extra } = obj;
        
        const displayName = loggerName || name;
        const nameTag = displayName ? chalk.dim(`[${displayName}]`) : '';
        
        let coloredMessage: string;
        
        switch (level) {
          case 20: // debug
            coloredMessage = chalk.gray(msg);
            break;
          case 30: // info
            coloredMessage = chalk.blue(msg);
            break;
          case 40: // warn
            coloredMessage = chalk.yellow(msg);
            break;
          case 50: // error
            coloredMessage = chalk.red(msg);
            break;
          case 60: // fatal
            coloredMessage = chalk.redBright.bold(msg);
            break;
          default:
            coloredMessage = msg;
        }
        
        let output = `${nameTag} ${coloredMessage}`.trim();
        
        if (Object.keys(extra).length > 0) {
          const extraStr = JSON.stringify(extra, null, 2);
          output += chalk.dim(` ${extraStr}`);
        }
        
        output += '\n';
        process.stderr.write(output);
      }
    });
  };
}

// Create a simple transport wrapper for synchronous use
function createSimpleCliTransport(loggerName?: string) {
  const colorMap = {
    20: chalk.gray,    // debug
    30: chalk.blue,    // info  
    40: chalk.yellow,  // warn
    50: chalk.red,     // error
    60: chalk.redBright.bold // fatal
  };

  return {
    write(chunk: string) {
      try {
        const log = JSON.parse(chunk);
        const { level, msg, name, ...extra } = log;
        
        const displayName = loggerName || name;
        const nameTag = displayName ? chalk.dim(`[${displayName}]`) : '';
        const colorFn = colorMap[level as keyof typeof colorMap] || ((x: string) => x);
        const coloredMessage = colorFn(msg);
        
        let output = `${nameTag} ${coloredMessage}`.trim();
        
        if (Object.keys(extra).length > 0) {
          const extraStr = JSON.stringify(extra, null, 2);
          output += chalk.dim(` ${extraStr}`);
        }
        
        output += '\n';
        process.stderr.write(output);
      } catch (err) {
        // Fallback for malformed JSON
        process.stderr.write(chunk);
      }
    }
  };
}

// Logger factory function  
export function createLogger(config: LoggerConfig) {
  const { context, name, level = 'info' } = config;
  
  if (context === 'cli') {
    // Create Pino logger with simple CLI transport
    return pino({
      name,
      level,
      base: null,
      timestamp: false,
    }, createSimpleCliTransport(name));
  }

  // For server/library, use structured logging
  return pino({
    name,
    level,
  }, pino.destination({ dest: 2, sync: true }));
}

export const logger = createLogger({ context: 'cli', name: 'vibeflow' });
export type VibeflowLogger = ReturnType<typeof createLogger>;