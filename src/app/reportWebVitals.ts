import type { NextWebVitalsMetric } from 'next/app';

import { recordTiming } from '../../benchmarks/reporters/jsonReporter';

const HYDRATION_METRIC_NAMES = new Set(['Next.js-hydration', 'Hydration']);

export function reportWebVitals(metric: NextWebVitalsMetric) {
  recordTiming('web-vitals', metric.name, metric.value, {
    id: metric.id,
    label: metric.label,
  });

  if (HYDRATION_METRIC_NAMES.has(metric.name)) {
    recordTiming('hydration', metric.name, metric.value, {
      id: metric.id,
      label: metric.label,
    });
  }
}
