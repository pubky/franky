import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function Homeserver(): React.ReactElement {
  return (
    <Molecules.OnboardingLayout testId="homeserver-content">
      <Molecules.HomeserverHeader />
      <Organisms.HomeserverCard />
    </Molecules.OnboardingLayout>
  );
}
