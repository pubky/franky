'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function TaggedSection() {
  const { userDetails } = Hooks.useCurrentUserProfile();
  const { tags, handleTagAdd } = Hooks.useTagged();

  const userName = userDetails?.name || '';

  return (
    <Atoms.Container className="gap-2 rounded-md bg-card p-6">
      <Atoms.Typography as="p" className="text-base font-medium text-secondary-foreground">
        {userName ? `${userName} was tagged as:` : 'Tagged as:'}
      </Atoms.Typography>

      <Molecules.TagInput onTagAdd={handleTagAdd} existingTags={tags} />

      <Molecules.TaggedList tags={tags} />
    </Atoms.Container>
  );
}
