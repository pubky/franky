import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Profile(): React.ReactElement {
  return (
    <Molecules.OnboardingLayout testId="profile-content">
      <Organisms.CreateProfileHeader />
      <Organisms.CreateProfileForm />
    </Molecules.OnboardingLayout>
  );
}
