import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function PublicKey() {
  return (
    <Molecules.PageWrapper>
      <Molecules.PublicKeyHeader />
      <Organisms.PublicKeyCard />
      <Molecules.PublicKeyNavigation />
    </Molecules.PageWrapper>
  );
}
