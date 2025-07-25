'use client';

import { DialogDownloadPubkyRing } from '@/components/ui';

interface StoreButtonsProps {
  className?: string;
}

export function StoreButtons({ className = 'flex gap-4 justify-around sm:justify-start' }: StoreButtonsProps) {
  return (
    <div className={className}>
      <DialogDownloadPubkyRing store="apple" />
      <DialogDownloadPubkyRing store="android" />
    </div>
  );
}
