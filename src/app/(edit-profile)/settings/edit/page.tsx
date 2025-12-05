import * as Templates from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Edit Profile - Settings',
  description: 'Edit your profile on pubky app.',
});

export default function SettingsEditPage() {
  return <Templates.EditProfile />;
}
