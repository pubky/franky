import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function PublicKey() {
  return (
    <Atoms.Container size="container">
      <Molecules.PublicKeyHeader />
      <Organisms.PublicKeyCard />
      <Molecules.PublicKeyNavigation />
    </Atoms.Container>
  );
}
