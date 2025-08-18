import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Homeserver() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.HomeserverHeader />
      <Organisms.InviteCodeCard />
    </Atoms.Container>
  );
}
