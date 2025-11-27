'use client';

import Image from 'next/image';
import { Plus, UsersRound } from 'lucide-react';
import * as Atoms from '@/atoms';

export function FollowersEmpty() {
  return (
    <Atoms.Container className="relative flex flex-col items-center justify-center gap-6 p-6">
      {/* Background image */}
      <Image
        src="/images/followers-empty-state.png"
        alt="Followers - Empty state"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Users icon */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-brand/16 p-6"
      >
        <UsersRound className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex w-full flex-col items-center justify-center"
      >
        <Atoms.Typography as="h3" size="lg" className="pb-6 text-center leading-8 font-bold">
          Looking for followers?
        </Atoms.Typography>
        <Atoms.Typography as="p" className="mb-0 text-center text-base leading-6 font-medium text-secondary-foreground">
          When someone follows this account, their profile will appear here.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-center text-base leading-6 font-medium text-secondary-foreground">
          Start posting and engaging with others to grow your followers!
        </Atoms.Typography>
      </Atoms.Container>

      {/* Create Post Button */}
      <Atoms.Container overrideDefaults={true} className="relative z-10 flex flex-col items-center justify-center">
        <Atoms.Button variant="default" className="gap-2 border-brand bg-brand/16 text-brand">
          <Plus className="size-4" />
          <span>Create a Post</span>
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
