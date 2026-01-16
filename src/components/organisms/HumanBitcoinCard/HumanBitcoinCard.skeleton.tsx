import * as Atoms from '@/atoms';
import React from 'react';

/**
 * Skeleton loading state for the price section.
 * Heights must match the actual content exactly to avoid layout shift:
 * - Price: text-5xl (48px) on mobile, text-6xl (60px) on desktop with leading-none
 * - Conversion: text-xs (12px) with line-height
 */
export function PriceSkeleton() {
  return (
    <React.Fragment>
      {/* Price skeleton - matches "₿ 1,000" with text-5xl/text-6xl leading-none */}
      <Atoms.Container className="h-[48px] w-36 animate-pulse rounded bg-muted lg:h-[60px]" overrideDefaults />
      {/* Conversion skeleton - matches "₿1,000 = $1.00" with text-xs */}
      <Atoms.Container className="h-[18px] w-32 animate-pulse rounded bg-muted" overrideDefaults />
    </React.Fragment>
  );
}
