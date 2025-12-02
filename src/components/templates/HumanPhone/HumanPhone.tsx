import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function HumanPhone() {
  return (
    <Molecules.OnboardingLayout testId="human-phone-content">
      <Organisms.HumanPhoneVerification1 />
      <Molecules.HumanFooter />
    </Molecules.OnboardingLayout>
  );
}
