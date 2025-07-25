'use client';

import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

interface ButtonsNavigationProps {
  className?: string;
  onHandleBackButton?: () => void;
  onHandleContinueButton?: () => void;
  backText?: string;
  continueText?: string;
  backButtonDisabled?: boolean;
  continueButtonDisabled?: boolean;
}

export function ButtonsNavigation({
  className = 'flex flex-col-reverse lg:flex-row gap-3 lg:gap-6 justify-between',
  onHandleBackButton,
  onHandleContinueButton,
  backText = 'Back',
  continueText = 'Continue',
  backButtonDisabled = false,
  continueButtonDisabled = false,
}: ButtonsNavigationProps) {
  return (
    <div className={className}>
      <Button
        size="lg"
        className="rounded-full"
        variant={'outline'}
        onClick={onHandleBackButton}
        disabled={backButtonDisabled}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {backText}
      </Button>
      <div className="flex items-center gap-1 w-full" />
      <Button size="lg" className="rounded-full" onClick={onHandleContinueButton} disabled={continueButtonDisabled}>
        <ArrowRight className="mr-2 h-4 w-4" />
        {continueText}
      </Button>
    </div>
  );
}
