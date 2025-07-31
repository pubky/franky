import { BackupNavigationOrganism, BackupHeaderOrganism, MainBackupOrganism, BackupOrganism } from '@/components/ui';

export function BackupTemplate() {
  return (
    <BackupOrganism>
      <BackupHeaderOrganism />
      <MainBackupOrganism />
      <BackupNavigationOrganism />
    </BackupOrganism>
  );
}
