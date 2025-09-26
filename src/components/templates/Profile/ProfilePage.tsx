import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';

export type TProfilePageProps = {
  pubkySlug: Core.Pubky;
};

export function ProfilePage({ pubkySlug }: TProfilePageProps) {
  return (
    <Atoms.Container size="container" className="w-full">
      <Organisms.ProfileHeader pubkySlug={pubkySlug} />
      <Atoms.Container size="container" className="w-full flex flex-row gap-6">
        <Organisms.ProfileLeftSidebar pubkySlug={pubkySlug} />
        <Organisms.ProfileContent pubkySlug={pubkySlug} />
        <Organisms.ProfileRightSidebar pubkySlug={pubkySlug} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
