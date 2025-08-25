import { ArrowRight, ArrowLeft } from 'lucide-react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface ButtonsNavigationProps {
  className?: string;
  onHandleBackButton?: () => void;
  onHandleContinueButton?: () => void;
  backText?: string;
  continueText?: string;
  backButtonDisabled?: boolean;
  continueButtonDisabled?: boolean;
  hiddenContinueButton?: boolean;
}

export function ButtonsNavigation({
  className,
  onHandleBackButton,
  onHandleContinueButton,
  backText = 'Back',
  continueText = 'Continue',
  backButtonDisabled = false,
  continueButtonDisabled = false,
  hiddenContinueButton = false,
}: ButtonsNavigationProps) {
  return (
    <Atoms.Container className={Libs.cn('flex-row gap-3 lg:gap-6 justify-between', className)}>
      <Atoms.Button
        size="lg"
        className="rounded-full flex-1 md:flex-0 w-full"
        variant={'secondary'}
        onClick={onHandleBackButton}
        disabled={backButtonDisabled}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {backText}
      </Atoms.Button>
      {!hiddenContinueButton && (
        <Atoms.Button
          size="lg"
          className="rounded-full flex-1 md:flex-0 w-full"
          onClick={onHandleContinueButton}
          disabled={continueButtonDisabled}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          {continueText}
        </Atoms.Button>
      )}
    </Atoms.Container>
  );
}
