'use client';

import Image from 'next/image';
import { Tag } from 'lucide-react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function TaggedEmpty() {
  return (
    <Atoms.Container className="relative flex flex-col items-center justify-center gap-6 p-6">
      {/* Background image */}
      <Image
        src="/images/tagged-empty-state.png"
        alt="Tagged - Empty state"
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Tag icon */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-brand/16 p-6"
      >
        <Tag className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title and subtitle */}
      <Atoms.Container className="relative z-10 flex w-full flex-col items-center justify-center gap-2">
        <Atoms.Typography as="h3" size="lg" className="text-center leading-8">
          Discover who tagged you
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-center text-base leading-6 font-medium text-secondary-foreground">
          No one has tagged you yet.
          <br />
          Tip: You can add tags to your own profile too.
        </Atoms.Typography>
      </Atoms.Container>

      {/* Tag input */}
      <Atoms.Container className="relative z-10 flex items-center justify-center">
        <Molecules.TagInput onTagAdd={() => {}} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
