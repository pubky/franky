import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Profile - Onboarding',
  description: 'Onboarding profile page on pubky app.',
});

export default function ProfilePage() {
  return <Organisms.ProfilePosts />;
}
