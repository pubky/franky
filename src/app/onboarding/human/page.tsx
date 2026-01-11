import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Verify Humanity - Onboarding',
  description: 'Onboarding verify humanity page on pubky app.',
});

export default function HumanPage() {
  return <Templates.Human />;
}
