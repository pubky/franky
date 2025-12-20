import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Backup() {
  return (
    <Molecules.OnboardingLayout testId="backup-content" navigation={<Organisms.BackupNavigation />}>
      <Organisms.BackupPageHeader />
      <Organisms.BackupMethodCard />
    </Molecules.OnboardingLayout>
  );
}
