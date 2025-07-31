'use client';

import { Container, DialogDownloadPubkyRing } from '@/components/ui';
import { cn } from '@/libs';

export function StoreButtons({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Container className={cn('flex gap-4 justify-around sm:justify-start', className)}>
      <DialogDownloadPubkyRing store="apple" />
      <DialogDownloadPubkyRing store="android" />
    </Container>
  );
}
