import * as Templates from '@/templates';
import * as Template from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Profile | Pubky',
  description: 'Your profile on Pubky',
});

interface ProfilePageParams {
  params: Promise<Template.TProfilePageProps>;
}

export default async function ProfilePage({ params }: ProfilePageParams) {
  const { pubkyParam } = await params;
  return <Templates.ProfilePage pubky={pubkyParam} />;
}
