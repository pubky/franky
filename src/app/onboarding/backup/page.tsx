import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Backup - Onboarding',
  description: 'Onboarding backup page on pubky app.',
});

export default function BackupPage(): React.ReactElement {
  return <Templates.Backup />;
}
