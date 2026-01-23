'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import type { ErrorBoundaryProviderProps } from './ErrorBoundaryProvider.types';

/**
 * ErrorBoundaryProvider
 *
 * Root-level error boundary that catches unhandled errors during React render.
 * Displays a fallback UI with the error message.
 */
export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
}
