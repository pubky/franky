import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Logout() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.LogoutContent />
      <Molecules.LogoutNavigation />
    </Atoms.Container>
  );
}
