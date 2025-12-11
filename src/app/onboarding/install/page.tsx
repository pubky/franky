import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Install - Onboarding',
  description: 'Onboarding install page on pubky app.',
});

export default function InstallPage(): React.ReactElement {
  return <Templates.Install />;
}
