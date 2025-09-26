import * as Templates from '@/templates';
import * as Molecules from '@/molecules';
import * as Core from '@/core';

export const metadata = Molecules.Metadata({
  title: 'Profile | Pubky',
  description: 'Your profile on Pubky',
});

type ProfilePageParams = {
  params: Promise<ProfileRouteParams>;
};

type ProfileRouteParams = {
  pubky: Core.Pubky;
};

export default async function ProfilePage({ params }: ProfilePageParams) {
  const { pubky } = await params;
  return <Templates.ProfilePage pubkySlug={pubky} />;
}
