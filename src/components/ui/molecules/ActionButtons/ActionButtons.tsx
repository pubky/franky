'use client';

import { LogIn, UserRoundPlus } from 'lucide-react';
import { Button } from '@/components/ui';

interface ActionButtonsProps {
  className?: string;
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  signInText?: string;
  createAccountText?: string;
}

export function ActionButtons({
  className = 'flex flex-col gap-3 sm:flex-row sm:items-center pt-6',
  onSignIn,
  onCreateAccount,
  signInText = 'Sign in',
  createAccountText = 'Create account',
}: ActionButtonsProps) {
  return (
    <div className={className}>
      <Button variant="secondary" className="w-full sm:w-auto order-2 sm:order-1" size="lg" onClick={onSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        {signInText}
      </Button>
      <Button className="w-full sm:w-auto order-1 sm:order-2" size="lg" onClick={onCreateAccount}>
        <UserRoundPlus className="mr-2 h-4 w-4" />
        {createAccountText}
      </Button>
    </div>
  );
}
