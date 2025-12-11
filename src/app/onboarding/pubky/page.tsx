import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Pubky - Onboarding',
  description: 'Onboarding pubky page on pubky app.',
});

export default function PubkyPage(): React.ReactElement {
  return <Templates.PublicKey />;
}
