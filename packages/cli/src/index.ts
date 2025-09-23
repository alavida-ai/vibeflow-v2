#!/usr/bin/env node
import { exit } from 'node:process';
import path from 'node:path';
import { Command } from 'commander';
import { compile, watch, type WatchOptions, type Manifest } from '@vibeflow/compiler';
import { startServer } from '@vibeflow/runtime-server';
import { createLogger } from '@vibeflow/logging';

// Create centralized logger for CLI
const log = createLogger({ 
  context: 'cli', 
  name: 'vibeflow-cli'
});

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

    log.info(`Starting Vibeflow runtime server on ${this.host}:${this.port}`);

    try {
      this.serverInstance = await startServer(manifest, this.outDir, { port: this.port, host: this.host });
      log.info(`Server started successfully`);
      log.info(`API available at http://${this.host}:${this.port}`);
      log.info(`Docs available at http://${this.host}:${this.port}/docs/swagger`);
    } catch (err) {
      log.error(`Server error: ${(err as Error).message}`);
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (!this.serverInstance) return;
    
    log.info(`Stopping server...`);
    this.serverInstance.stop();
    this.serverInstance = null;
    log.info(`Server stopped`);
  }

  async reloadWorkflows(manifest: Manifest): Promise<void> {
    if (!this.serverInstance) {
      await this.start(manifest);
      return;
    }

    log.info(`Rebuilding workflow server...`);
    await this.serverInstance.reloadWorkflows(manifest);
    log.info(`Workflow server rebuilt and remounted`);
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
      log.info(`Compiling workflows from ${resolvedSrc}`);
      const manifest = await compile({ srcDir: resolvedSrc, outDir: resolvedOut });
      log.info(`Compiled ${manifest.workflows.length} workflows to ${resolvedOut}`);
    } catch (err) {
      log.error(`${(err as Error).message}`);
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

    log.info(`Starting Vibeflow development server`);
    log.info(`Source: ${resolvedSrc}`);
    log.info(`Output: ${resolvedOut}`);

    const devServer = new DevServer(resolvedSrc, resolvedOut, port, host);
    let watchStop: (() => Promise<void>) | null = null;

    // Graceful shutdown handling
    const shutdown = async () => {
      log.info(`Shutting down...`);
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
            log.info(`Workflow changes detected, recompiling...`);
          }
          if (evt === 'build-success') {
            const manifest = info?.manifest;
            if (!manifest) return;
            
            const count = manifest.workflows.length;
            log.info(`Compiled ${count} workflow${count !== 1 ? 's' : ''}`);
            
            // Rebuild and remount workflow server after successful compilation  
            await devServer.reloadWorkflows(manifest);
          }
          if (evt === 'build-error') {
            log.error(`Compilation failed: ${info?.error?.message}`);
            log.warn(`Workflow server not rebuilt due to compilation errors`);
          }
        },
      } as WatchOptions);

      // Note: watch() performs an initial build and will trigger build-success → start server

      log.info(`Vibeflow development server is ready!`);
      log.info(`Watching for workflow changes in ${resolvedSrc}`);
      log.info(`Press Ctrl+C to stop`);

    } catch (err) {
      log.error(`${(err as Error).message}`);
      if (watchStop) await watchStop();
      await devServer.stop();
      exit(1);
    }
  });

program.parseAsync(process.argv);


