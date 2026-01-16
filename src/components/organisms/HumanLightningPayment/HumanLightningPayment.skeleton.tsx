import * as Atoms from '@/atoms';
import React from 'react';

/**
 * Skeleton for QR code while loading invoice.
 * Matches the size of the actual QR code container (192x192).
 */
export function QRCodeSkeleton() {
  return <Atoms.Container overrideDefaults className="h-[192px] w-[192px] animate-pulse rounded-[9px] bg-muted" />;
}

/**
 * Skeleton for price section while loading invoice.
 * Heights match the actual content to avoid layout shift.
 */
export function PriceSkeleton() {
  return (
    <React.Fragment>
      {/* Price skeleton - matches "₿ 10" with text-5xl/text-6xl leading-none */}
      <Atoms.Container className="h-[48px] w-28 animate-pulse rounded bg-muted lg:h-[60px]" overrideDefaults />
      {/* Description skeleton - matches "Pay ₿ 10 (approximately $0.01) to continue." */}
      <Atoms.Container className="h-6 w-64 animate-pulse rounded bg-muted" overrideDefaults />
    </React.Fragment>
  );
}
