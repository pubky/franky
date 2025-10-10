# Benchmarking Guide

Franky ships with a lightweight benchmarking toolchain designed to profile rendering, store churn, Dexie access, and homeserver flows without introducing external infrastructure. This document explains the moving parts and how to extend the suite.

## Overview

- **Instrumentation** – Runtime hooks inside Dexie, Zustand stores, React components, and homeserver adapters emit measurements only when `NEXT_PUBLIC_BENCHMARKS=true`.
- **CLI runner** – `npm run bench` loads every `*.bench.ts(x)` file under `benchmarks/`, executes the suites with [`tinybench`](https://github.com/tinylabs/tinybench), and writes structured output to `benchmarks/results/`.
- **Reporters** – Measurements accumulate in memory through `benchmarks/reporters/jsonReporter.ts` and can be flushed to JSON or Markdown summaries.

## Running benchmarks

```bash
# Local run with pretty console output and artifacts in benchmarks/results/
npm run bench

# CI oriented run (uses ci-* artifact names)
npm run bench:ci

# Discover available suites without executing them
npx ts-node --esm benchmarks/cli.ts --list
```

The CLI automatically sets `NEXT_PUBLIC_BENCHMARKS=true`, discovers every `*.bench.ts` or `*.bench.tsx` file, registers their tasks, and executes them sequentially. Results are exported to:

- `benchmarks/results/latest.json` (or `ci-latest.json` in CI mode) – raw event stream plus tinybench statistics.
- `benchmarks/results/latest.md` – Markdown summary table for quick sharing.

## Instrumented subsystems

### Zustand stores

All stores created under `src/core/stores/**` use the `withStoreBenchmarking` middleware. When benchmarking is enabled, each `setState` call and subscription callback records:

- Duration per action (`zustand` scope timing events)
- Global action and render counters
- In-memory history accessible via `getStoreBenchmarkSnapshot()` or the `useStoreBenchmarkMetrics()` hook

### Dexie database

`src/core/database/franky/franky.ts` wraps common Dexie table methods (`add`, `put`, `update`, `delete`, `bulk*`, `get`, `toArray`, `count`) and reports duration per table/method. Instrumentation is opt-in and only activates when benchmarking is enabled, keeping production performance unaffected.

### React component harness

`benchmarks/components/benchmarkHarness.tsx` renders any component exported from `src/components/index.ts` inside `React.Profiler`, tracks commit counts, average commit duration, and optional store deltas. Use it inside new benchmark suites to exercise component templates with realistic providers.

### Homeserver and services

Local services (`LocalPostService`, `LocalTagService`) and `HomeserverService` delegate their asynchronous work through `traceAsync`, ensuring every fetch, signup, tag mutation, and Dexie transaction is observable.

## Adding new suites

1. Create a file under `benchmarks/` (e.g., `benchmarks/components/profileCard.bench.tsx`).
2. Export an async `registerBenchmarks(bench: Bench)` function and call `bench.add()` for each task.
3. Use helpers from `benchmarks/runtime.ts` (e.g., `traceAsync`) and reporters as needed.
4. Run `npm run bench` to validate the suite. Artifacts land in `benchmarks/results/`.

Bench files are regular TypeScript/TSX modules; the CLI runs them via `ts-node --esm`, so Node APIs are available. For browser-like needs, import `'fake-indexeddb/auto'` or provide mock clients (see `benchmarks/services/homeserver.bench.ts`).

## Working with results

- Raw events contain scope, metric name, timestamp, and optional metadata. Consume them programmatically for regression tracking.
- Markdown summaries (generated automatically) can be attached to PRs or dashboards.
- For store-level assertions inside component benchmarks, call `useStoreBenchmarkMetrics(storeName)` to compare action/render budgets.

## Environment notes

- Instrumentation activates only when `NEXT_PUBLIC_BENCHMARKS` resolves truthy (`1`, `true`). Local scripts set this automatically.
- The CLI installs stub clients for homeserver benchmarks and seeds Dexie with `fake-indexeddb` so tests run deterministically.
- Production builds remain untouched; all instrumentation short-circuits when the flag is false.

Happy benchmarking!
