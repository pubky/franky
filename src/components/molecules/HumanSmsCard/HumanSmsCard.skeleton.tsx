import * as Atoms from '@/atoms';

/**
 * Skeleton loading state for SMS verification card.
 */
export function HumanSmsCardSkeleton() {
  return (
    <Atoms.Card data-testid="sms-verification-card-skeleton" className="flex-1 gap-0 p-6 md:p-12">
      <Atoms.Container className="flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
        {/* Image skeleton - hidden on mobile */}
        <Atoms.Container className="hidden h-full w-full flex-1 items-center lg:block lg:w-auto">
          <Atoms.Container className="size-48 animate-pulse rounded bg-muted" overrideDefaults />
        </Atoms.Container>

        <Atoms.Container className="w-full flex-1 items-start gap-6">
          <Atoms.Container className="w-full gap-3">
            <Atoms.Container className="h-8 w-48 animate-pulse rounded bg-muted" overrideDefaults />
            <Atoms.Container className="h-12 w-20 animate-pulse rounded bg-muted lg:h-15" overrideDefaults />
            <Atoms.Container className="h-4 w-44 animate-pulse rounded bg-muted" overrideDefaults />
            <Atoms.Container className="gap-1">
              <Atoms.Container className="h-6 w-24 animate-pulse rounded bg-muted" overrideDefaults />
              <Atoms.Container className="h-6 w-32 animate-pulse rounded bg-muted" overrideDefaults />
            </Atoms.Container>
          </Atoms.Container>
          <Atoms.Container className="h-10 w-36 animate-pulse rounded-full bg-muted" overrideDefaults />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
}
