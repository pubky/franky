import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';

export function Backup() {
  return (
    <Molecules.PageWrapper>
      <Molecules.HomePageHeading title="Back up your pubky." />
      <Atoms.PageSubtitle title="You need a backup to restore access to your account later." />
      <Molecules.BackupMethodCard />
      <Molecules.BackupNavigation />
    </Molecules.PageWrapper>
  );
}
