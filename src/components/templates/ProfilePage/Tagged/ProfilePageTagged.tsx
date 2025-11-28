'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function ProfilePageTagged() {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { tags } = Hooks.useTagged();
  const { stats } = Hooks.useProfileStats(currentUserPubky ?? '');

  if (tags.length === 0) {
    return (
      <Atoms.Container className="mt-6 lg:mt-0">
        <Molecules.TaggedEmpty />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="mt-6 gap-3 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Tagged ({stats.uniqueTags})
      </Atoms.Heading>
      <Molecules.TaggedSection />
    </Atoms.Container>
  );
}
