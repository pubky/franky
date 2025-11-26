'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { NexusTag } from '@/core/services/nexus/nexus.types';

export interface TaggedListProps {
  /** Array of tags to display */
  tags: NexusTag[];
}

export function TaggedList({ tags }: TaggedListProps) {
  return (
    <Atoms.Container overrideDefaults={true} className="flex flex-col gap-2">
      {tags.map((tag) => (
        <Molecules.TaggedItem key={tag.label} tag={tag} />
      ))}
    </Atoms.Container>
  );
}
