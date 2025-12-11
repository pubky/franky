import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Homeserver - Onboarding',
  description: 'Onboarding homeserver page on pubky app.',
});

export default function HomeserverPage(): React.ReactElement {
  return <Templates.Homeserver />;
}
