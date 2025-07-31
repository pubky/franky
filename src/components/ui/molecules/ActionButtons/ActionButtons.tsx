'use client';

import { LogIn, UserRoundPlus } from 'lucide-react';
import { Button, Container } from '@/components/ui';
import { cn } from '@/libs';

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
    <Container className={cn('flex-col gap-3 sm:flex-row sm:items-center pt-6', className)} {...props}>
      <Button variant="secondary" className="w-full sm:w-auto order-2 sm:order-1" size="lg" onClick={onSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        {signInText}
      </Button>
      <Button className="w-full sm:w-auto order-1 sm:order-2" size="lg" onClick={onCreateAccount}>
        <UserRoundPlus className="mr-2 h-4 w-4" />
        {createAccountText}
      </Button>
    </Container>
  );
}
