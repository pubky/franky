import React, { Profiler, type ProfilerOnRenderCallback } from 'react';
import { createRoot } from 'react-dom/client';

import * as Components from '../../src/components';
import * as Providers from '../../src/providers';
import { recordCounter, recordTiming } from '../reporters/jsonReporter.ts';
import { benchmarkNow, isBenchmarkingEnabled } from '../config';
import {
  getStoreBenchmarkSnapshot,
  resetStoreBenchmarkMetrics,
} from '../../src/core/stores/storeBenchmarking';

export interface ComponentScenario<Props> {
  name: string;
  props: Props;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}

export interface ComponentBenchmarkOptions {
  wrapper?: React.ComponentType<React.PropsWithChildren>;
  iterations?: number;
  warmupIterations?: number;
  trackedStores?: string[];
}

export interface StoreBenchmarkSummary {
  store: string;
  actions: number;
  renders: number;
}

export interface ComponentBenchmarkResult {
  component: string;
  scenario: string;
  commits: number;
  totalDuration: number;
  averageDuration: number;
  storeMetrics: StoreBenchmarkSummary[];
}

const DefaultWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Providers.DatabaseProvider>{children}</Providers.DatabaseProvider>
);

const ensureDomAvailable = () => {
  if (typeof document === 'undefined') {
    throw new Error(
      'Component benchmarking requires a DOM-like environment. Ensure jsdom or a browser runtime is available.',
    );
  }
};

const resolveComponent = <K extends keyof typeof Components>(componentKey: K) => {
  const component = Components[componentKey];
  if (!component) {
    throw new Error(`Component ${String(componentKey)} is not exported from src/components/index.ts`);
  }
  return component;
};

const waitForPaint = () => new Promise((resolve) => setTimeout(resolve, 0));

const clampToZero = (value: number) => (value < 0 ? 0 : value);

export async function runComponentBenchmark<K extends keyof typeof Components>(
  componentKey: K,
  scenarios: ComponentScenario<React.ComponentProps<(typeof Components)[K]>>[],
  options: ComponentBenchmarkOptions = {},
): Promise<ComponentBenchmarkResult[]> {
  ensureDomAvailable();

  const component = resolveComponent(componentKey) as React.ComponentType<any>;
  const Wrapper = options.wrapper ?? DefaultWrapper;
  const warmupIterations = options.warmupIterations ?? 1;
  const iterations = options.iterations ?? 5;
  const trackedStores = options.trackedStores ?? [];

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const results: ComponentBenchmarkResult[] = [];

  try {
    for (const scenario of scenarios) {
      const scenarioId = `${String(componentKey)}:${scenario.name}`;
      let commitCount = 0;
      let totalDuration = 0;

      const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
        if (phase === 'mount' || phase === 'update') {
          commitCount += 1;
          totalDuration += actualDuration;
          recordTiming('react-profiler', scenarioId, actualDuration, { phase });
        }
      };

      const baselineMetrics = trackedStores.reduce<Record<string, ReturnType<typeof getStoreBenchmarkSnapshot> | undefined>>(
        (acc, store) => {
          acc[store] = getStoreBenchmarkSnapshot(store);
          return acc;
        },
        {},
      );

      for (let iteration = 0; iteration < warmupIterations + iterations; iteration += 1) {
        if (scenario.beforeEach) {
          await scenario.beforeEach();
        }

        const element = (
          <Wrapper>
            <Profiler id={scenarioId} onRender={onRender}>
              {React.createElement(component, scenario.props)}
            </Profiler>
          </Wrapper>
        );

        const renderStart = benchmarkNow();
        root.render(element);
        await waitForPaint();
        recordTiming('component-benchmark', `${scenarioId}:render`, benchmarkNow() - renderStart, {
          iteration,
          warmup: iteration < warmupIterations,
        });

        if (scenario.afterEach) {
          await scenario.afterEach();
        }
      }

      const measuredCommits = clampToZero(commitCount - warmupIterations);
      const averageDuration = measuredCommits > 0 ? totalDuration / measuredCommits : 0;

      const storeMetrics: StoreBenchmarkSummary[] = trackedStores.map((store) => {
        const after = getStoreBenchmarkSnapshot(store);
        const before = baselineMetrics[store];
        const actions = (after?.actionCount ?? 0) - (before?.actionCount ?? 0);
        const renders = (after?.renderCount ?? 0) - (before?.renderCount ?? 0);

        recordCounter('zustand', `${store}.scenario.actions`, actions, {
          store,
          scenario: scenarioId,
        });
        recordCounter('zustand', `${store}.scenario.renders`, renders, {
          store,
          scenario: scenarioId,
        });

        return { store, actions, renders };
      });

      results.push({
        component: String(componentKey),
        scenario: scenario.name,
        commits: measuredCommits,
        totalDuration,
        averageDuration,
        storeMetrics,
      });

      recordTiming('component-benchmark', scenarioId, averageDuration, {
        commits: measuredCommits,
        totalDuration,
        stores: storeMetrics,
      });
    }
  } finally {
    root.unmount();
    container.remove();
    trackedStores.forEach((store) => resetStoreBenchmarkMetrics(store));
  }

  if (!isBenchmarkingEnabled()) {
    console.warn('[benchmarks] runComponentBenchmark executed with benchmarking disabled. Set NEXT_PUBLIC_BENCHMARKS=true.');
  }

  return results;
}
