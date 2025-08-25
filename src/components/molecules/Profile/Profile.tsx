'use client';

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export const ProfileNavigation = ({
  continueButtonDisabled,
  continueText = 'Finish',
  onContinue,
  className,
  onHandleBackButton,
  backText = 'Back',
  backButtonDisabled,
  hiddenContinueButton,
  continueButtonLoading,
}: {
  continueButtonDisabled: boolean;
  continueText: string;
  onContinue: () => void;
  className?: string;
  onHandleBackButton?: () => void;
  backText?: string;
  backButtonDisabled?: boolean;
  hiddenContinueButton?: boolean;
  continueButtonLoading?: boolean;
}) => {
  const onHandleContinueButton = () => {
    onContinue();
  };

  return (
    <Atoms.Container className={Libs.cn('flex-row gap-3 lg:gap-6 justify-between py-6', className)}>
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
          {continueButtonLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {continueText}
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              {continueText}
            </>
          )}
        </Atoms.Button>
      )}
    </Atoms.Container>
  );
};
