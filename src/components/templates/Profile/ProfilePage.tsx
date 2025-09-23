import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

export type TProfilePageParams = {
  pubky: string;
};

export type TProfilePageProps = {
  pubkyParam: string;
};

export function ProfilePage({ pubky }: TProfilePageParams) {
  return (
    <Atoms.Container size="container" className="w-full">
      <Organisms.ProfileHeader pubkyParam={pubky} />
      <Atoms.Container size="container" className="w-full flex flex-row gap-6">
        <Organisms.ProfileLeftSidebar />
        <Organisms.ProfileContent pubkyParam={pubky} />
        <Organisms.ProfileRightSidebar />
      </Atoms.Container>
    </Atoms.Container>
  );
}
