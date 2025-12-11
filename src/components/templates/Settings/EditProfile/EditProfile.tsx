import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function EditProfile(): React.ReactElement {
  return (
    <Molecules.OnboardingLayout testId="edit-profile-content">
      <Organisms.EditProfileHeader />
      <Organisms.EditProfileForm />
    </Molecules.OnboardingLayout>
  );
}
