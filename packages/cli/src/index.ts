#!/usr/bin/env node
import { exit } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { compile, watch, type WatchOptions } from '@vibeflow/compiler';
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
  private serverProcess: ChildProcess | null = null;
  private isShuttingDown = false;

  constructor(
    private srcDir: string,
    private outDir: string,
    private port: number = 4111,
    private host: string = 'localhost'
  ) {}

  async start(): Promise<void> {
    if (this.serverProcess) {
      log.warn('Server already running, stopping first...');
      await this.stop();
    }

    log.server(`${log.time()} Starting Vibeflow runtime server on ${this.host}:${this.port}`);

    // Determine the path to the runtime server
    const runtimeServerPath = path.resolve(__dirname, '../../vibe-runtime-server/src/server.ts');
    
    // Use tsx to run the server in development mode for better error reporting
    this.serverProcess = spawn('npx', ['tsx', runtimeServerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SRC_DIR: this.srcDir,
        OUT_DIR: this.outDir,
        RUNTIME_SERVER_PORT: this.port.toString(),
        RUNTIME_SERVER_HOST: this.host,
        NODE_ENV: 'development',
      },
    });

    if (!this.serverProcess.stdout || !this.serverProcess.stderr) {
      throw new Error('Failed to spawn server process');
    }

    // Store references to avoid TypeScript null checks
    const serverProcess = this.serverProcess;
    const stdout = serverProcess.stdout;
    const stderr = serverProcess.stderr;

    // Forward server output with prefixes
    if (stdout) {
      stdout.on('data', (data: Buffer) => {
        const output = data.toString().trim();
        if (output) {
          output.split('\n').forEach(line => {
            if (line.trim()) {
              console.log(`${chalk.dim('[server]')} ${line}`);
            }
          });
        }
      });
    }

    if (stderr) {
      stderr.on('data', (data: Buffer) => {
        const output = data.toString().trim();
        if (output) {
          output.split('\n').forEach(line => {
            if (line.trim()) {
              console.log(`${chalk.dim('[server]')} ${chalk.red(line)}`);
            }
          });
        }
      });
    }

    serverProcess.on('exit', (code, signal) => {
      if (!this.isShuttingDown) {
        if (code === 0) {
          log.server(`${log.time()} Server exited gracefully`);
        } else {
          log.error(`${log.time()} Server exited with code ${code} (signal: ${signal})`);
        }
      }
      this.serverProcess = null;
    });

    serverProcess.on('error', (err) => {
      log.error(`${log.time()} Server error: ${err.message}`);
    });

    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (this.serverProcess && !this.serverProcess.killed) {
      log.success(`${log.time()} Server started successfully`);
      log.info(`${log.time()} API available at http://${this.host}:${this.port}`);
      log.info(`${log.time()} Docs available at http://${this.host}:${this.port}/docs/swagger`);
    }
  }

  async stop(): Promise<void> {
    if (!this.serverProcess) return;

    this.isShuttingDown = true;
    log.server(`${log.time()} Stopping server...`);

    return new Promise((resolve) => {
      if (!this.serverProcess) {
        resolve();
        return;
      }

      const killTimer = setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          log.warn(`${log.time()} Force killing server process`);
          this.serverProcess.kill('SIGKILL');
        }
      }, 5000);

      this.serverProcess.on('exit', () => {
        clearTimeout(killTimer);
        this.serverProcess = null;
        this.isShuttingDown = false;
        log.server(`${log.time()} Server stopped`);
        resolve();
      });

      // Try graceful shutdown first
      this.serverProcess.kill('SIGTERM');
    });
  }

  async restart(): Promise<void> {
    log.server(`${log.time()} Restarting server...`);
    await this.stop();
    await this.start();
  }

  isRunning(): boolean {
    return this.serverProcess !== null && !this.serverProcess.killed;
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
        onEvent: async (evt: 'build-start' | 'build-success' | 'build-error', info?: { error?: Error; manifest?: any }) => {
          if (evt === 'build-start') {
            log.build(`${log.time()} Workflow changes detected, recompiling...`);
          }
          if (evt === 'build-success') {
            const count = info?.manifest?.workflows.length ?? 0;
            log.success(`${log.time()} Compiled ${count} workflow${count !== 1 ? 's' : ''}`);
            
            // Restart server after successful compilation
            if (devServer.isRunning()) {
              await devServer.restart();
            } else {
              await devServer.start();
            }
          }
          if (evt === 'build-error') {
            log.error(`${log.time()} Compilation failed: ${info?.error?.message}`);
            log.warn(`${log.time()} Server not restarted due to compilation errors`);
          }
        },
      } as WatchOptions);

      // Start the server for the first time after initial compilation
      await devServer.start();

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


