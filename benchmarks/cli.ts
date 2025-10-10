#!/usr/bin/env node
import { Bench } from 'tinybench';
import type { Task } from 'tinybench';
import { pathToFileURL } from 'node:url';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  BENCHMARK_MARKDOWN_FILE,
  BENCHMARK_SUMMARY_FILE,
  DEFAULT_ITERATIONS,
  DEFAULT_WARMUP_ITERATIONS,
  benchmarkTimestamp,
  isBenchmarkingEnabled,
  setBenchmarkingEnabled,
} from './config.ts';
import { recordCounter, writeEventsToJson, writeMarkdownSummary } from './reporters/jsonReporter.ts';

const BENCHMARK_EXTENSIONS = ['.bench.ts', '.bench.tsx', '.bench.js', '.bench.mjs'];

interface CliOptions {
  ci: boolean;
  summaryFile?: string;
  markdownFile?: string;
  listOnly?: boolean;
}

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = { ci: false };

  argv.forEach((arg) => {
    if (arg === '--ci') {
      options.ci = true;
    } else if (arg.startsWith('--json=')) {
      options.summaryFile = arg.split('=')[1];
    } else if (arg.startsWith('--markdown=')) {
      options.markdownFile = arg.split('=')[1];
    } else if (arg === '--list') {
      options.listOnly = true;
    }
  });

  return options;
};

const isBenchFile = (filePath: string) => BENCHMARK_EXTENSIONS.some((ext) => filePath.endsWith(ext));

const walkDirectory = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry);
    const stats = await stat(absolute);
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue;
      const nested = await walkDirectory(absolute);
      files.push(...nested);
    } else if (isBenchFile(absolute) && !absolute.endsWith('cli.ts')) {
      files.push(absolute);
    }
  }

  return files;
};

const registerTasksFromModule = async (bench: Bench, modulePath: string) => {
  const fileUrl = pathToFileURL(modulePath).href;
  const imported = await import(fileUrl);

  const candidates = [imported.registerBenchmarks, imported.default];

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      await candidate(bench);
      return true;
    }
  }

  if (Array.isArray(imported.benchmarks)) {
    imported.benchmarks.forEach((definition: { name: string; handler: () => unknown }) => {
      if (definition?.name && typeof definition.handler === 'function') {
        bench.add(definition.name, definition.handler);
      }
    });
    return true;
  }

  return false;
};

const formatResultRow = (task: Task) => {
  const result = task.result;
  if (!result) {
    return {
      name: task.name,
      averageMs: undefined,
      margin: undefined,
      samples: undefined,
      hz: undefined,
    };
  }

  const averageMs = Number.isFinite(result.mean) ? result.mean * 1000 : undefined;
  const sampleCount = Array.isArray(result.samples) ? result.samples.length : undefined;
  return {
    name: task.name,
    averageMs,
    margin: Number.isFinite(result.margin) ? result.margin : undefined,
    samples: sampleCount,
    hz: Number.isFinite(result.hz) ? result.hz : undefined,
  };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (!isBenchmarkingEnabled()) {
    setBenchmarkingEnabled(true);
  }

  const bench = new Bench({
    warmupIterations: DEFAULT_WARMUP_ITERATIONS,
    iterations: DEFAULT_ITERATIONS,
  });

  const benchRoot = path.join(process.cwd(), 'benchmarks');
  const benchFiles = (await walkDirectory(benchRoot)).sort();

  if (benchFiles.length === 0) {
    console.warn('[benchmarks] No benchmark files discovered.');
    return;
  }

  if (options.listOnly) {
    console.log('[benchmarks] discovered suites:');
    benchFiles.forEach((file) => console.log(` - ${path.relative(process.cwd(), file)}`));
    return;
  }

  for (const file of benchFiles) {
    await registerTasksFromModule(bench, file);
  }

  if (bench.tasks.length === 0) {
    console.warn('[benchmarks] No benchmark tasks registered.');
    return;
  }

  console.log(`Running ${bench.tasks.length} benchmark task(s) at ${benchmarkTimestamp()}...`);
  await bench.run();

  const failedTasks = bench.tasks.filter((task) => task.result?.error);
  if (failedTasks.length > 0) {
    console.warn('[benchmarks] some tasks failed:');
    failedTasks.forEach((task) => {
      console.warn(` - ${task.name}:`, task.result?.error);
      const errorDetails = task.result?.error?.details;
      if (errorDetails) {
        console.warn('   details:', JSON.stringify(errorDetails, null, 2));
      }
    });
  }

  const rows = bench.tasks.map(formatResultRow);
  console.table(
    rows.map((row) => ({
      Task: row.name,
      'Avg (ms)': row.averageMs?.toFixed(3) ?? '-',
      'Margin %': row.margin !== undefined ? (row.margin * 100).toFixed(2) : '-',
      Samples: row.samples ?? '-',
      'Ops/sec': row.hz ? row.hz.toFixed(2) : '-',
    })),
  );

  recordCounter('bench', 'tasks', bench.tasks.length, { mode: options.ci ? 'ci' : 'local' });

  const summaryFile = options.summaryFile ?? (options.ci ? `ci-${BENCHMARK_SUMMARY_FILE}` : BENCHMARK_SUMMARY_FILE);
  const markdownFile = options.markdownFile ?? (options.ci ? `ci-${BENCHMARK_MARKDOWN_FILE}` : BENCHMARK_MARKDOWN_FILE);

  await writeEventsToJson({ fileName: summaryFile, extra: { results: rows } });
  await writeMarkdownSummary(rows, markdownFile);
};

main().catch((error) => {
  console.error('[benchmarks] CLI failed', error);
  process.exitCode = 1;
});
