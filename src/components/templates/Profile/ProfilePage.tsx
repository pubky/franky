import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

export interface ProfilePageProps {
  pubky: string;
}

export function ProfilePage({ pubky }: ProfilePageProps) {
  return (
    <Atoms.Container size="container" className="px-6">
      <Organisms.ProfileHeader pubkyParam={pubky} />
    </Atoms.Container>
  );
}
