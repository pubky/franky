import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface ActionButtonsProps {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  signInText?: string;
  createAccountText?: string;
}

export function ActionButtons({
  className,
  onSignIn,
  onCreateAccount,
  signInText = 'Sign in',
  createAccountText = 'Create account',
  ...props
}: ActionButtonsProps): React.ReactElement {
  return (
    <Atoms.Container className={Libs.cn('flex-row gap-3 sm:items-center', className)} {...props}>
      <Atoms.Button id="sign-in-btn" variant="secondary" className="w-[158px] sm:w-auto" size="lg" onClick={onSignIn}>
        <Libs.LogIn className="mr-2 h-4 w-4" />
        {signInText}
      </Atoms.Button>
      <Atoms.Button id="create-account-btn" className="w-[158px] sm:w-auto" size="lg" onClick={onCreateAccount}>
        <Libs.UserRoundPlus className="mr-2 h-4 w-4" />
        {createAccountText}
      </Atoms.Button>
    </Atoms.Container>
  );
}
