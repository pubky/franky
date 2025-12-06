'use client';

import * as Molecules from '@/molecules';
import * as Types from './TimelineStateWrapper.types';

/**
 * TimelineStateWrapper
 *
 * Handles rendering of loading, error, and empty states for timeline components.
 * Reduces boilerplate in timeline components by centralizing state rendering logic.
 */
export function TimelineStateWrapper({
  loading,
  error,
  hasItems,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: Types.TimelineStateWrapperProps) {
  // Loading state (initial load)
  if (loading) {
    return <>{loadingComponent ?? <Molecules.TimelineLoading />}</>;
  }

  // Error state (initial load, no items)
  if (error && !hasItems) {
    return <>{errorComponent ?? <Molecules.TimelineInitialError message={error} />}</>;
  }

  // Empty state
  if (!hasItems) {
    return <>{emptyComponent ?? <Molecules.TimelineEmpty />}</>;
  }

  // Render children when we have items
  return <>{children}</>;
}
