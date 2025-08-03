import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Install() {
  return (
    <Atoms.Container size="container">
      <Molecules.InstallHeader />
      <Molecules.InstallCard />
      <Molecules.InstallFooter />
      <Molecules.InstallNavigation />
    </Atoms.Container>
  );
}
