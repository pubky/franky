import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Install() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.InstallHeader />
      <Molecules.InstallCard />
      <Molecules.InstallFooter />
      <Molecules.InstallNavigation />
    </Atoms.Container>
  );
}
