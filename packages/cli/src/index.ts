#!/usr/bin/env node
import { exit } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { compile, watch, type WatchOptions, type Manifest } from '@vibeflow/compiler';
import { startServer } from '@vibeflow/runtime-server';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import type { ChildProcess } from 'node:child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging utilities
const log = {
  info: (msg: string) => console.log(`${chalk.blue('ℹ')} ${msg}`),
  success: (msg: string) => console.log(`${chalk.green('✓')} ${msg}`),
  warn: (msg: string) => console.log(`${chalk.yellow('⚠')} ${msg}`),
  error: (msg: string) => console.log(`${chalk.red('✗')} ${msg}`),
  build: (msg: string) => console.log(`${chalk.cyan('🔨')} ${msg}`),
  server: (msg: string) => console.log(`${chalk.magenta('🚀')} ${msg}`),
  time: () => chalk.gray(`[${new Date().toLocaleTimeString()}]`),
};

class DevServer {
  private serverInstance: any = null;

  constructor(
    private srcDir: string,
    private outDir: string,
    private port: number = 4111,
    private host: string = 'localhost'
  ) {}

  async start(manifest: Manifest): Promise<void> {
    if (this.serverInstance) {
      log.warn('Server already running, rebuilding workflows instead...');
      await this.reloadWorkflows(manifest);
      return;
    }

    log.server(`${log.time()} Starting Vibeflow runtime server on ${this.host}:${this.port}`);

    try {
      this.serverInstance = await startServer(manifest, this.outDir, { port: this.port, host: this.host });
      log.success(`${log.time()} Server started successfully`);
      log.info(`${log.time()} API available at http://${this.host}:${this.port}`);
      log.info(`${log.time()} Docs available at http://${this.host}:${this.port}/docs/swagger`);
    } catch (err) {
      log.error(`${log.time()} Server error: ${(err as Error).message}`);
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (!this.serverInstance) return;
    
    log.server(`${log.time()} Stopping server...`);
    this.serverInstance.stop();
    this.serverInstance = null;
    log.server(`${log.time()} Server stopped`);
  }

  async reloadWorkflows(manifest: Manifest): Promise<void> {
    if (!this.serverInstance) {
      await this.start(manifest);
      return;
    }

    log.server(`${log.time()} Rebuilding workflow server...`);
    await this.serverInstance.reloadWorkflows(manifest);
    log.success(`${log.time()} Workflow server rebuilt and remounted`);
  }

  isServerRunning(): boolean {
    return this.serverInstance !== null;
  }
}

const program = new Command();
program
  .name('vibe')
  .description('Vibeflow CLI')
  .version('0.1.0');

program
  .command('build')
  .description('Compile workflows to .vibeflow')
  .option('--src <dir>', 'Source dir', 'studio/workflows')
  .option('--out <dir>', 'Output dir', '.vibeflow')
  .action(async (opts: { src: string; out: string }) => {
    const resolvedSrc = path.resolve(process.cwd(), opts.src);
    const resolvedOut = path.resolve(process.cwd(), opts.out);
    try {
      log.build(`${log.time()} Compiling workflows from ${resolvedSrc}`);
      const manifest = await compile({ srcDir: resolvedSrc, outDir: resolvedOut });
      log.success(`${log.time()} Compiled ${manifest.workflows.length} workflows to ${resolvedOut}`);
    } catch (err) {
      log.error(`${log.time()} ${(err as Error).message}`);
      exit(1);
    }
  });

program
  .command('dev')
  .description('Start development server with workflow watching')
  .option('--src <dir>', 'Source dir', 'studio/workflows')
  .option('--out <dir>', 'Output dir', '.vibeflow')
  .option('--port <port>', 'Server port', '4111')
  .option('--host <host>', 'Server host', 'localhost')
  .option('--debounce <ms>', 'Debounce milliseconds', '200')
  .action(async (opts: { src: string; out: string; port: string; host: string; debounce: string }) => {
    const resolvedSrc = path.resolve(process.cwd(), opts.src);
    const resolvedOut = path.resolve(process.cwd(), opts.out);
    const port = Number.parseInt(opts.port, 10) || 4111;
    const host = opts.host || 'localhost';
    const debounceMs = Number.parseInt(opts.debounce, 10) || 200;

    log.info(`${log.time()} Starting Vibeflow development server`);
    log.info(`${log.time()} Source: ${resolvedSrc}`);
    log.info(`${log.time()} Output: ${resolvedOut}`);

    const devServer = new DevServer(resolvedSrc, resolvedOut, port, host);
    let watchStop: (() => Promise<void>) | null = null;

    // Graceful shutdown handling
    const shutdown = async () => {
      log.info(`${log.time()} Shutting down...`);
      if (watchStop) {
        await watchStop();
      }
      await devServer.stop();
      exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    try {
      // Start file watching
      watchStop = await watch({
        srcDir: resolvedSrc,
        outDir: resolvedOut,
        debounceMs,
        onEvent: async (evt: 'build-start' | 'build-success' | 'build-error', info?: { error?: Error; manifest?: Manifest }) => {
          if (evt === 'build-start') {
            log.build(`${log.time()} Workflow changes detected, recompiling...`);
          }
          if (evt === 'build-success') {
            const manifest = info?.manifest;
            if (!manifest) return;
            
            const count = manifest.workflows.length;
            log.success(`${log.time()} Compiled ${count} workflow${count !== 1 ? 's' : ''}`);
            
            // Rebuild and remount workflow server after successful compilation  
            await devServer.reloadWorkflows(manifest);
          }
          if (evt === 'build-error') {
            log.error(`${log.time()} Compilation failed: ${info?.error?.message}`);
            log.warn(`${log.time()} Workflow server not rebuilt due to compilation errors`);
          }
        },
      } as WatchOptions);

      // Note: watch() performs an initial build and will trigger build-success → start server

      log.success(`${log.time()} Vibeflow development server is ready!`);
      log.info(`${log.time()} Watching for workflow changes in ${resolvedSrc}`);
      log.info(`${log.time()} Press Ctrl+C to stop`);

    } catch (err) {
      log.error(`${log.time()} ${(err as Error).message}`);
      if (watchStop) await watchStop();
      await devServer.stop();
      exit(1);
    }
  });

program.parseAsync(process.argv);


