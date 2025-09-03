import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function SignIn() {
  return (
    <Atoms.Container size="container" className="px-6">
      <Molecules.SignInContent />
      <Molecules.SignInFooter />
      <Molecules.SignInNavigation />
    </Atoms.Container>
  );
}
