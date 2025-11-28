'use client';

import Image from 'next/image';
import { Frown } from 'lucide-react';
import * as Atoms from '@/atoms';

export function NotificationsEmpty() {
  return (
    <Atoms.Container className="relative items-center gap-6 px-0 py-6">
      {/* Background image */}
      <Image
        src="/images/notifications-empty-state.png"
        alt="Notifications - Empty state"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Icon */}
      <Atoms.Container overrideDefaults={true} className="flex items-center rounded-full bg-brand/16 p-6">
        <Frown className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/*Title and subtitle*/}
      <Atoms.Container className="items-center gap-6">
        <Atoms.Typography as="h3" size="lg">
          Nothing to see here yet
        </Atoms.Typography>

        <Atoms.Typography className="text-center text-base leading-6 font-medium text-secondary-foreground">
          Tags, follows, reposts and account information will be displayed here.
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}
