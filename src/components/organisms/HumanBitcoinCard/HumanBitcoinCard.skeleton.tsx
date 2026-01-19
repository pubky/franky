import * as Atoms from '@/atoms';

/**
 * Skeleton for the price section while loading.
 */
export function PriceSkeleton() {
  return (
    <>
      <Atoms.Container className="h-12 w-36 animate-pulse rounded bg-muted lg:h-15" overrideDefaults />
      <Atoms.Container className="h-4 w-32 animate-pulse rounded bg-muted" overrideDefaults />
    </>
  );
}

/**
 * Skeleton loading state for Bitcoin payment card.
 */
export function HumanBitcoinCardSkeleton() {
  return (
    <Atoms.Card data-testid="bitcoin-payment-card-skeleton" className="flex-1 gap-0 p-6 md:p-12">
      <Atoms.Container className="flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        {/* Image + label skeleton - hidden on mobile */}
        <Atoms.Container className="hidden w-full flex-1 flex-col items-center gap-3 lg:flex lg:w-auto">
          <Atoms.Container className="size-48 animate-pulse rounded bg-muted" overrideDefaults />
          <Atoms.Container className="h-4 w-28 animate-pulse rounded bg-muted" overrideDefaults />
        </Atoms.Container>

        <Atoms.Container className="w-full flex-1 items-start gap-6">
          <Atoms.Container className="w-full gap-3">
            <Atoms.Container className="h-8 w-40 animate-pulse rounded bg-muted" overrideDefaults />
            <Atoms.Container className="h-12 w-36 animate-pulse rounded bg-muted lg:h-15" overrideDefaults />
            <Atoms.Container className="h-4 w-32 animate-pulse rounded bg-muted" overrideDefaults />
            <Atoms.Container className="gap-1">
              <Atoms.Container className="h-6 w-24 animate-pulse rounded bg-muted" overrideDefaults />
              <Atoms.Container className="h-6 w-32 animate-pulse rounded bg-muted" overrideDefaults />
            </Atoms.Container>
          </Atoms.Container>
          <Atoms.Container className="h-10 w-28 animate-pulse rounded-full bg-muted" overrideDefaults />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
}
