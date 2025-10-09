import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Backup() {
  return (
    <Atoms.Container
      size="container"
      className="min-h-dvh items-stretch gap-6 px-6 pb-6 pt-4 lg:gap-10 lg:min-h-0 lg:items-start"
    >
      <div data-testid="backup-content" className="flex w-full flex-1 flex-col gap-6 lg:gap-10 lg:flex-none">
        <Molecules.BackupPageHeader />
        <Organisms.BackupMethodCard />
      </div>
      <div className="mt-auto w-full lg:mt-0">
        <Molecules.BackupNavigation />
      </div>
    </Atoms.Container>
  );
}
