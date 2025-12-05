'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as App from '@/app';

export function HomeserverCard() {
  const router = useRouter();

  const { toast } = Molecules.useToast();

  const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // const [status, setStatus] = useState<'default' | 'success' | 'error'>('default');
  const { pubky, secretKey, inviteCode } = Core.useOnboardingStore();
  const [buttonContinueText, setButtonContinueText] = useState('Continue');

  const showErrorToast = () => {
    const toastInstance = toast({
      title: 'Error signing up',
      description: 'Invalid invite code or already used. Please try again.',
      action: (
        <Atoms.Button
          variant="outline"
          className="h-10 rounded-full border-brand bg-transparent px-4 text-white hover:bg-brand/16"
          onClick={() => toastInstance.dismiss()}
        >
          OK
        </Atoms.Button>
      ),
    });
  };

  const onHandleContinueButton = async () => {
    try {
      setContinueButtonDisabled(true);
      // setStatus('default');
      setIsLoading(true);
      setButtonContinueText('Validating');
      const keypair = { pubky, secretKey };
      const signupToken = inviteCode;
      await Core.AuthController.signUp({ keypair, signupToken });
      setButtonContinueText('Signing up');
      router.push(App.ONBOARDING_ROUTES.PROFILE);
    } catch {
      showErrorToast();
      setContinueButtonDisabled(false);
      // setStatus('error');
      setButtonContinueText('Try again');
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return !continueButtonDisabled && !isLoading;
  };

  // const handleKeyDown = Hooks.useEnterSubmit(isFormValid, onHandleContinueButton);

  return (
    <Atoms.Container className="flex w-full flex-1 flex-col gap-6 lg:flex-none" data-testid="homeserver-card">
      <Molecules.ContentCard
        image={{
          src: '/images/gift.png',
          alt: 'Server',
          width: 192,
          height: 192,
        }}
      >
        <Atoms.Container className="gap-1">
          <Atoms.Heading level={3} size="lg" className="flex flex-row items-center gap-1">
            Invite code for Pubky homeserver {inviteCode}
            <Molecules.PopoverInviteHomeserver />
          </Atoms.Heading>
          <Atoms.Typography size="sm" className="text-base font-medium text-secondary-foreground opacity-80">
            You get 1GB of storage, used for your posts, photos, videos, and your profile.
          </Atoms.Typography>
        </Atoms.Container>

        <Atoms.Container className="mt-3 w-full flex-col gap-3">
          <Atoms.Container className="mt-3 flex-col items-start gap-3 md:flex-row md:items-center">
            <Atoms.Button variant={'secondary'} className="rounded-full" onClick={() => {}} disabled={true}>
              <Libs.Server className="mr-2 h-4 w-4" />
              Custom homeserver
            </Atoms.Button>
            <Atoms.Typography className="text-base-secondary-foreground text-base font-normal opacity-80">
              Using a different homeserver will be possible soon.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Molecules.ContentCard>
      <Molecules.HomeserverFooter />
      <Molecules.HomeserverNavigation
        continueButtonDisabled={!isFormValid()}
        onHandleContinueButton={onHandleContinueButton}
        continueText={buttonContinueText}
      />
    </Atoms.Container>
  );
}
