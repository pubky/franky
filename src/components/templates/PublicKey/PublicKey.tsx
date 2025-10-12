import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function PublicKey() {
  return (
    <Molecules.OnboardingLayout testId="public-key-content" navigation={<Molecules.PublicKeyNavigation />}>
      <Molecules.PublicKeyHeader />
      <Organisms.PublicKeyCard />
    </Molecules.OnboardingLayout>
  );
}
