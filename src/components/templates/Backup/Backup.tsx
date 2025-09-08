import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Backup() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.BackupPageHeader />
      <Organisms.BackupMethodCard />
      <Molecules.BackupNavigation />
    </Atoms.Container>
  );
}
