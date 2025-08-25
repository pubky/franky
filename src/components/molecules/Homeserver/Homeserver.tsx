'use client';

import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';

export const HomeserverHeader = () => {
  return (
    <Atoms.PageHeader>
      <Molecules.PageTitle size="large">
        Choose <span className="text-brand">homeserver.</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle>Enter your invite code to access the Pubky homeserver. </Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};

export const HomeserverFooter = () => {
  return (
    <Atoms.FooterLinks className="pt-6">
      By creating an account on the Pubky homeserver, you agree to the <Molecules.DialogTerms />,{' '}
      <Molecules.DialogPrivacy />, and you confirm that you are <Molecules.DialogAge />
    </Atoms.FooterLinks>
  );
};

export const HomeserverNavigation = ({
  continueButtonDisabled,
  onHandleContinueButton,
  continueText,
}: {
  continueButtonDisabled: boolean;
  onHandleContinueButton: () => void;
  continueText: string;
}) => {
  const router = useRouter();

  const onHandleBackButton = () => {
    router.push('/onboarding/backup');
  };

  return (
    <Molecules.ButtonsNavigation
      className="py-6"
      onHandleBackButton={onHandleBackButton}
      onHandleContinueButton={onHandleContinueButton}
      continueButtonDisabled={continueButtonDisabled}
      continueText={continueText}
    />
  );
};
