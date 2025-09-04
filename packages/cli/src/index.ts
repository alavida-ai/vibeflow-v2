#!/usr/bin/env node
import { exit } from 'node:process';
import path from 'node:path';
import { Command } from 'commander';
import { compile, watch, type WatchOptions } from '@vibeflow/compiler';

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
      const manifest = await compile({ srcDir: resolvedSrc, outDir: resolvedOut });
      console.log(`Compiled ${manifest.workflows.length} workflows to ${resolvedOut}`);
    } catch (err) {
      console.error((err as Error).message);
      exit(1);
    }
  });

program
  .command('dev')
  .description('Watch workflows and compile on change')
  .option('--src <dir>', 'Source dir', 'studio/workflows')
  .option('--out <dir>', 'Output dir', '.vibeflow')
  .option('--debounce <ms>', 'Debounce milliseconds', '200')
  .action(async (opts: { src: string; out: string; debounce: string }) => {
    const resolvedSrc = path.resolve(process.cwd(), opts.src);
    const resolvedOut = path.resolve(process.cwd(), opts.out);
    const debounceMs = Number.parseInt(opts.debounce, 10) || 200;
    let stop: (() => Promise<void>) | null = null;
    try {
      stop = await watch({
        srcDir: resolvedSrc,
        outDir: resolvedOut,
        debounceMs,
        onEvent: (evt: 'build-start' | 'build-success' | 'build-error', info?: { error?: Error; manifest?: any }) => {
          if (evt === 'build-start') console.log('Compiling...');
          if (evt === 'build-success') console.log(`Compiled ${info?.manifest?.workflows.length ?? 0} workflows`);
          if (evt === 'build-error') console.error(info?.error?.message);
        },
      } as WatchOptions);
      console.log('Watching for changes...');
    } catch (err) {
      console.error((err as Error).message);
      if (stop) await stop();
      exit(1);
    }
  });

program.parseAsync(process.argv);


