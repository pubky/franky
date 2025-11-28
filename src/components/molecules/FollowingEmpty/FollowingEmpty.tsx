'use client';

import Image from 'next/image';
import { UserRoundPlus } from 'lucide-react';
import * as Atoms from '@/atoms';

export function FollowingEmpty() {
  return (
    <Atoms.Container className="relative items-center gap-6 px-0 py-6">
      {/* Background image */}
      <Image
        src="/images/connections-empty-state.png"
        alt="Following - Empty state"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Icon */}
      <Atoms.Container overrideDefaults={true} className="flex items-center rounded-full bg-brand/16 p-6">
        <UserRoundPlus className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title and subtitle */}
      <Atoms.Container className="items-center gap-6">
        <Atoms.Typography as="h3" size="lg">
          You are the algorithm
        </Atoms.Typography>

        <Atoms.Typography className="text-center text-base leading-6 font-medium text-secondary-foreground">
          Following account is a simple way to curate your timeline.
          <br />
          Stay updated on the topics and people that interest you.
        </Atoms.Typography>
      </Atoms.Container>

      {/* Action Buttons */}
      <Atoms.Container className="items-center justify-center gap-3 lg:flex-row">
        <Atoms.Button variant="secondary" size="default" className="gap-2">
          <UserRoundPlus className="size-4" />
          <Atoms.Typography as="span" overrideDefaults={true}>
            Who to Follow
          </Atoms.Typography>
        </Atoms.Button>
        <Atoms.Button variant="secondary" size="default" className="gap-2">
          <UserRoundPlus className="size-4" />
          <Atoms.Typography as="span" overrideDefaults={true}>
            Popular Users
          </Atoms.Typography>
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
