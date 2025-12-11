'use client';

import Image from 'next/image';
import { Plus, UsersRound } from 'lucide-react';
import * as Atoms from '@/atoms';

export function FollowersEmpty(): React.ReactElement {
  return (
    <Atoms.Container data-cy="profile-followers-empty" className="relative items-center gap-6 px-0 py-6">
      {/* Background image */}
      <Image
        src="/images/connections-empty-state.png"
        alt="Followers - Empty state"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Icon */}
      <Atoms.Container overrideDefaults={true} className="flex items-center rounded-full bg-brand/16 p-6">
        <UsersRound className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title and subtitle */}
      <Atoms.Container className="items-center gap-6">
        <Atoms.Typography as="h3" size="lg">
          Looking for followers?
        </Atoms.Typography>

        <Atoms.Typography className="text-center text-base leading-6 font-medium text-secondary-foreground">
          When someone follows this account, their profile will appear here.
          <br />
          Start posting and engaging with others to grow your followers!
        </Atoms.Typography>
      </Atoms.Container>

      {/* CTA */}
      <Atoms.Button variant="default" size="default" className="gap-2">
        <Plus className="size-4" />
        <Atoms.Typography as="span" overrideDefaults={true}>
          Create a Post
        </Atoms.Typography>
      </Atoms.Button>
    </Atoms.Container>
  );
}
