'use client';

import * as Atoms from '@/atoms';

/**
 * Skeleton loading state for the user info popover.
 * Matches the layout of PostHeaderUserInfoPopoverContent.
 */
export function PostHeaderUserInfoPopoverSkeleton() {
  return (
    <Atoms.Container className="animate-pulse gap-3">
      {/* Header skeleton */}
      <Atoms.Container className="flex min-w-0 items-center gap-2" overrideDefaults>
        <Atoms.Container className="size-10 rounded-full bg-muted" overrideDefaults />
        <Atoms.Container className="min-w-0 flex-1 gap-1">
          <Atoms.Container className="h-5 w-24 rounded bg-muted" overrideDefaults />
          <Atoms.Container className="h-4 w-16 rounded bg-muted" overrideDefaults />
        </Atoms.Container>
      </Atoms.Container>

      {/* Bio skeleton */}
      <Atoms.Container className="h-6 w-full rounded bg-muted" overrideDefaults />

      {/* Stats skeleton */}
      <Atoms.Container className="flex items-start gap-2.5" overrideDefaults>
        <Atoms.Container className="flex-1 gap-2">
          <Atoms.Container className="h-4 w-20 rounded bg-muted" overrideDefaults />
        </Atoms.Container>
        <Atoms.Container className="flex-1 gap-2">
          <Atoms.Container className="h-4 w-20 rounded bg-muted" overrideDefaults />
        </Atoms.Container>
      </Atoms.Container>

      {/* Button skeleton */}
      <Atoms.Container className="h-8 w-24 rounded bg-muted" overrideDefaults />
    </Atoms.Container>
  );
}
