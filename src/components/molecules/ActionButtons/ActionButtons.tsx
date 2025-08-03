import { LogIn, UserRoundPlus } from 'lucide-react';

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
    <Atoms.Container className={Libs.cn('flex-col gap-3 sm:flex-row sm:items-center', className)} {...props}>
      <Atoms.Button variant="secondary" className="w-full sm:w-auto order-2 sm:order-1" size="lg" onClick={onSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        {signInText}
      </Atoms.Button>
      <Atoms.Button className="w-full sm:w-auto order-1 sm:order-2" size="lg" onClick={onCreateAccount}>
        <UserRoundPlus className="mr-2 h-4 w-4" />
        {createAccountText}
      </Atoms.Button>
    </Atoms.Container>
  );
}
