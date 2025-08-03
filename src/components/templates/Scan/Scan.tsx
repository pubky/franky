import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Scan() {
  return (
    <Atoms.Container size="container">
      <Molecules.ScanContent />
      <Molecules.ScanFooter />
      <Molecules.ScanNavigation />
    </Atoms.Container>
  );
}
