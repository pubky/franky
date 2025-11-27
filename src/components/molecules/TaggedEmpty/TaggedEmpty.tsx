'use client';

import { Tag } from 'lucide-react';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function TaggedEmpty() {
  const { handleTagAdd } = Hooks.useTagged();

  return (
    <Molecules.ProfilePageEmptyState
      imageSrc="/images/tagged-empty-state.png"
      imageAlt="Tagged - Empty state"
      icon={Tag}
      title="Discover who tagged you"
      subtitle={
        <>
          No one has tagged you yet.
          <br />
          Tip: You can add tags to your own profile too.
        </>
      }
    >
      <Molecules.TagInput onTagAdd={handleTagAdd} />
    </Molecules.ProfilePageEmptyState>
  );
}
