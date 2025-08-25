import { LogIn, UserRoundPlus } from '@/libs/icons';

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
}: ActionButtonsProps) {
  return (
    <Atoms.Container className={Libs.cn('gap-3 flex-row sm:items-center', className)} {...props}>
      <Atoms.Button variant="secondary" className="w-auto" size="lg" onClick={onSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        {signInText}
      </Atoms.Button>
      <Atoms.Button className="w-auto" size="lg" onClick={onCreateAccount}>
        <UserRoundPlus className="mr-2 h-4 w-4" />
        {createAccountText}
      </Atoms.Button>
    </Atoms.Container>
  );
}
