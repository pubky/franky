import type { BenchmarkMetadata } from '../runtime.ts';
import { BENCHMARK_RESULTS_DIR, BENCHMARK_MARKDOWN_FILE, BENCHMARK_SUMMARY_FILE, benchmarkTimestamp, isBenchmarkingEnabled } from '../config.ts';

export type BenchmarkEvent =
  | {
      type: 'timing';
      scope: string;
      name: string;
      duration: number;
      timestamp: string;
      meta?: BenchmarkMetadata;
    }
  | {
      type: 'counter';
      scope: string;
      name: string;
      value: number;
      timestamp: string;
      meta?: BenchmarkMetadata;
    };

const events: BenchmarkEvent[] = [];
const subscribers = new Set<(event: BenchmarkEvent) => void>();

const notify = (event: BenchmarkEvent) => {
  subscribers.forEach((subscriber) => {
    try {
      subscriber(event);
    } catch (error) {
      console.error('[benchmarks] subscriber failed', error);
    }
  });
};

const shouldRecord = () => isBenchmarkingEnabled();

export const recordTiming = (scope: string, name: string, duration: number, meta?: BenchmarkMetadata) => {
  if (!shouldRecord()) {
    return;
  }

  const event: BenchmarkEvent = {
    type: 'timing',
    scope,
    name,
    duration,
    meta,
    timestamp: benchmarkTimestamp(),
  };

  events.push(event);
  notify(event);
};

export const recordCounter = (scope: string, name: string, value: number, meta?: BenchmarkMetadata) => {
  if (!shouldRecord()) {
    return;
  }

  const event: BenchmarkEvent = {
    type: 'counter',
    scope,
    name,
    value,
    meta,
    timestamp: benchmarkTimestamp(),
  };

  events.push(event);
  notify(event);
};

export const getRecordedEvents = () => [...events];

export const subscribeToEvents = (subscriber: (event: BenchmarkEvent) => void) => {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
};

const isNodeRuntime = () => typeof window === 'undefined';

const resolveResultsPath = async (fileName: string) => {
  const { default: path } = await import('node:path');
  const { cwd } = await import('node:process');
  return path.join(cwd(), BENCHMARK_RESULTS_DIR, fileName);
};

const ensureResultsDir = async () => {
  const { default: path } = await import('node:path');
  const fs = await import('node:fs/promises');
  const { cwd } = await import('node:process');
  const dir = path.join(cwd(), BENCHMARK_RESULTS_DIR);
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

export interface WriteOptions {
  fileName?: string;
  events?: BenchmarkEvent[];
  extra?: Record<string, unknown>;
}

export const writeEventsToJson = async (options: WriteOptions = {}) => {
  if (!isNodeRuntime()) {
    return;
  }

  const fs = await import('node:fs/promises');
  await ensureResultsDir();
  const fileName = options.fileName ?? BENCHMARK_SUMMARY_FILE;
  const targetPath = await resolveResultsPath(fileName);

  const payload = {
    generatedAt: benchmarkTimestamp(),
    events: options.events ?? events,
    ...options.extra,
  };

  await fs.writeFile(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
  return targetPath;
};

export interface MarkdownSummaryItem {
  name: string;
  averageMs?: number;
  samples?: number;
  margin?: number;
  hz?: number;
}

export const writeMarkdownSummary = async (
  results: MarkdownSummaryItem[],
  fileName: string = BENCHMARK_MARKDOWN_FILE,
) => {
  if (!isNodeRuntime()) {
    return;
  }

  const fs = await import('node:fs/promises');
  await ensureResultsDir();
  const targetPath = await resolveResultsPath(fileName);

  const lines = [
    `# Benchmark Summary`,
    '',
    `Generated: ${benchmarkTimestamp()}`,
    '',
    '| Task | Avg (ms) | Margin | Samples | Ops/sec |',
    '| --- | ---: | ---: | ---: | ---: |',
  ];

  if (results.length === 0) {
    lines.push('| _No benchmark tasks executed_ | - | - | - | - |');
  } else {
    for (const result of results) {
      lines.push(
        `| ${result.name} | ${result.averageMs?.toFixed(3) ?? '-'} | ${
          result.margin !== undefined ? `${(result.margin * 100).toFixed(2)}%` : '-'
        } | ${result.samples ?? '-'} | ${result.hz ? result.hz.toFixed(2) : '-'} |`,
      );
    }
  }

  const markdown = `${lines.join('\n')}\n`;
  await fs.writeFile(targetPath, markdown, 'utf-8');
  return targetPath;
};
