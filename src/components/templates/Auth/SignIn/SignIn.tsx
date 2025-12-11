import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function SignIn(): React.ReactElement {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.SignInContent />
      <Molecules.SignInFooter />
      <Organisms.SignInNavigation />
    </Atoms.Container>
  );
}
