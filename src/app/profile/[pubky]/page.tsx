import * as Templates from '@/templates';
import * as Template from '@/templates';
import * as Molecules from '@/molecules';

export const metadata = Molecules.Metadata({
  title: 'Profile | Pubky',
  description: 'Your profile on Pubky',
});

interface ProfilePageParams {
  params: Promise<Template.ProfilePageProps>;
}

export default async function ProfilePage({ params }: ProfilePageParams) {
  const { pubky } = await params;
  return <Templates.ProfilePage pubky={pubky} />;
}
