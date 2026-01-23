import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

/**
 * Props for the ErrorBoundaryProvider component.
 */
export interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

/**
 * Props for the ErrorFallback component.
 * Extends react-error-boundary's FallbackProps.
 */
export type ErrorFallbackProps = FallbackProps;
