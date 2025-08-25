import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

export function Profile() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Organisms.CreateProfileHeader />
      <Organisms.CreateProfileForm />
    </Atoms.Container>
  );
}
