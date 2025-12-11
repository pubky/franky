import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Profile - Onboarding',
  description: 'Onboarding profile page on pubky app.',
});

export default function ProfilePage(): React.ReactElement {
  return <Templates.Profile />;
}
