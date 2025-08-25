import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Backup() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.BackupPageHeader />
      <Molecules.BackupMethodCard />
      <Molecules.BackupNavigation />
    </Atoms.Container>
  );
}
