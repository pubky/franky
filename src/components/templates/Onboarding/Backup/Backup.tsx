import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Backup(): React.ReactElement {
  return (
    <Molecules.OnboardingLayout testId="backup-content" navigation={<Molecules.BackupNavigation />}>
      <Molecules.BackupPageHeader />
      <Organisms.BackupMethodCard />
    </Molecules.OnboardingLayout>
  );
}
