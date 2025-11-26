'use client';

import Image from 'next/image';
import { Frown } from 'lucide-react';
import * as Atoms from '@/atoms';

export function NotificationsEmpty() {
  return (
    <Atoms.Container className="relative items-center justify-center gap-6 p-6">
      {/* Background image - mobile */}
      <Image
        src="/images/notifications-empty-state-mobile.png"
        alt="Notifications - Empty state image for mobile devices"
        fill
        className="pointer-events-none object-contain object-center lg:hidden"
        aria-hidden="true"
      />

      {/* Background image - desktop */}
      <Image
        src="/images/notifications-empty-state-desktop.png"
        alt="Notifications - Empty state image for desktop devices"
        fill
        className="pointer-events-none hidden object-contain object-center lg:block"
        aria-hidden="true"
      />

      {/* Sad face icon */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative flex shrink-0 items-center justify-center rounded-full bg-brand/16 p-6"
      >
        <Frown className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/*Title and subtitle*/}
      <Atoms.Container className="relative z-10 items-center justify-center">
        <Atoms.Typography as="h3" size="lg" className="pb-6 text-center leading-8">
          Nothing to see here yet
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-center text-base leading-6 font-medium text-secondary-foreground">
          Tags, follows, reposts and account information will be displayed here.
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}
