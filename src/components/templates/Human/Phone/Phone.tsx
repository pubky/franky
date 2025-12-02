import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Human() {
  return (
    <Molecules.OnboardingLayout testId="human-content">
      <Molecules.HumanHeader />
      <Organisms.HumanVerificationCards />
      <Molecules.HumanFooter />
    </Molecules.OnboardingLayout>
  );
}
