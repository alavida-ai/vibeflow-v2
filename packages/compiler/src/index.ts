import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import fg from 'fast-glob';
import yaml from 'js-yaml';
import chokidar from 'chokidar';
import { ZodError } from 'zod';
import { WorkflowSchema, type WorkflowInput } from './schema';
import type { CompileOptions, Manifest, ManifestWorkflowEntry } from './types';

// Export types for external use
export type { WorkflowInput, StepInput } from './schema';
export type { Manifest, ManifestWorkflowEntry, CompileOptions } from './types';

export { WorkflowSchema, StepSchema } from './schema';

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function toStableJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function hashContent(content: string): string {
  return crypto.createHash('sha1').update(content).digest('hex');
}

function formatYamlError(file: string, error: unknown): string {
  const msg = (error as Error & { mark?: { line?: number; column?: number } }).message;
  const mark = (error as { mark?: { line?: number; column?: number } }).mark;
  if (mark && (typeof mark.line === 'number' || typeof mark.column === 'number')) {
    const line = (mark.line ?? 0) + 1;
    const col = (mark.column ?? 0) + 1;
    return `YAML error in ${file}:${line}:${col} — ${msg}`;
  }
  return `YAML error in ${file}: ${msg}`;
}

function formatZodError(file: string, error: ZodError): string {
  const issue = error.errors[0];
  const pathStr = issue.path.length ? issue.path.join('.') : '<root>';
  return `Schema error in ${file} at ${pathStr} — ${issue.message}`;
}

export async function compile(options: CompileOptions): Promise<Manifest> {
  const srcDir = path.resolve(options.srcDir);
  const outDir = path.resolve(options.outDir || '.vibeflow');
  const outWorkflowsDir = path.join(outDir, 'workflows');

  await ensureDir(outWorkflowsDir);

  const yamlFiles = await fg(['**/*.y?(a)ml'], { cwd: srcDir, dot: false, absolute: true });

  const entries: ManifestWorkflowEntry[] = [];

  for (const file of yamlFiles) {
    const raw = await fs.readFile(file, 'utf8');
    let parsed: unknown;
    try {
      parsed = yaml.load(raw);
    } catch (e) {
      throw new Error(formatYamlError(file, e));
    }

    const result = WorkflowSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(formatZodError(file, result.error));
    }

    const workflow = result.data as WorkflowInput;
    const outRelPath = `workflows/${workflow.id}.json`;
    const outAbsPath = path.join(outDir, outRelPath);

    const normalized = {
      id: workflow.id,
      description: workflow.description ?? '',
      steps: workflow.steps.map(s => ({
        id: s.id,
        description: s.description ?? '',
        prompt: s.prompt,
        acceptance_criteria: Array.isArray(s.acceptance_criteria)
          ? s.acceptance_criteria
          : (s.acceptance_criteria ? [s.acceptance_criteria] : []),
      })),
    } satisfies WorkflowInput;

    const json = toStableJson(normalized);
    await ensureDir(path.dirname(outAbsPath));
    await fs.writeFile(outAbsPath, json, 'utf8');

    entries.push({ id: workflow.id, path: outRelPath, hash: hashContent(json) });
  }

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    workflows: entries.sort((a, b) => a.id.localeCompare(b.id)),
  };

  await fs.writeFile(path.join(outDir, 'manifest.json'), toStableJson(manifest), 'utf8');

  return manifest;
}

export interface WatchOptions extends CompileOptions {
  debounceMs?: number;
  onEvent?: (evt: 'build-start' | 'build-success' | 'build-error', info?: { error?: Error; manifest?: Manifest }) => void;
}

export async function watch(options: WatchOptions): Promise<() => Promise<void>> {
  const srcDir = path.resolve(options.srcDir);
  const outDir = path.resolve(options.outDir || '.vibeflow');
  const debounceMs = options.debounceMs ?? 250;

  await ensureDir(outDir);

  let timer: NodeJS.Timeout | null = null;
  let closed = false;

  const rebuild = async () => {
    if (closed) return;
    options.onEvent?.('build-start');
    try {
      const manifest = await compile({ srcDir, outDir });
      options.onEvent?.('build-success', { manifest });
    } catch (error) {
      const err = error as Error;
      // Pretty-print one line; CLI can colorize later
      options.onEvent?.('build-error', { error: err });
    }
  };

  const trigger = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(rebuild, debounceMs);
  };

  // Initial build
  await rebuild();

  const watcher = chokidar.watch(['**/*.y?(a)ml'], {
    cwd: srcDir,
    ignoreInitial: true,
  });

  watcher.on('add', trigger).on('change', trigger).on('unlink', trigger);

  return async () => {
    closed = true;
    if (timer) clearTimeout(timer);
    await watcher.close();
  };
}




