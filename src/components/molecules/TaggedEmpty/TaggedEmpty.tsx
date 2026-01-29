'use client';

import { Tag } from 'lucide-react';
import * as Molecules from '@/molecules';
import type { TaggedEmptyProps } from './TaggedEmpty.types';

export function TaggedEmpty({ onTagAdd }: TaggedEmptyProps) {
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
      {onTagAdd && <Molecules.TagInput onTagAdd={onTagAdd} enableApiSuggestions />}
    </Molecules.ProfilePageEmptyState>
  );
}
