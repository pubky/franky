'use client';

import { useEffect, useState } from 'react';
import { Server } from 'lucide-react';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';

export function InviteCodeCard() {
  const { toast } = Molecules.useToast();

  const [inviteCode, setInviteCode] = useState('');
  const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'default' | 'success' | 'error'>('default');
  const { secretKey, publicKey } = Core.useOnboardingStore();
  const [buttonContinueText, setButtonContinueText] = useState('Continue');

  // generate an invite code and put it in console log if you are in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      Core.AuthController.generateSignupToken().then((token) => {
        Libs.Logger.info('token', token);
      });
    }
  }, []);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: extract this function to a helper function, maybe a mask function
    // Allow only uppercase alphanumerics and format as AAAA-BBBB-CCCC
    const uppercaseValue = e.target.value.toUpperCase();
    const alphanumericOnly = uppercaseValue.replace(/[^A-Z0-9]/g, '');
    const trimmed = alphanumericOnly.slice(0, 12);
    const groups = trimmed.match(/.{1,4}/g) || [];
    const formatted = groups.join('-');
    setInviteCode(formatted);
    setContinueButtonDisabled(formatted.length !== 14);
  };

  const showErrorToast = () => {
    const toastInstance = toast({
      title: 'Error signing up',
      description: 'Invalid invite code or already used. Please try again.',
      action: (
        <Atoms.Button
          variant="outline"
          className="rounded-full h-10 px-4 bg-transparent border-brand text-white hover:bg-brand/20"
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
      setStatus('default');
      setIsLoading(true);
      setButtonContinueText('Validating...');

      await Core.AuthController.signUp({ publicKey, secretKey }, inviteCode);
      setStatus('success');
      // TODO: next step
      // router.push('/onboarding/create-account');
    } catch {
      showErrorToast();
      setContinueButtonDisabled(false);
      setStatus('error');
      setButtonContinueText('Try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Molecules.ContentCard
        image={{
          src: '/images/gift.png',
          alt: 'Server',
          width: 192,
          height: 192,
        }}
      >
        <Atoms.Container className="gap-1">
          <Atoms.Heading level={3} size="lg" className="gap-1 flex flex-row items-center">
            Invite code for Pubky homeserver
            <Molecules.PopoverInviteHomeserver />
          </Atoms.Heading>
          <Atoms.Typography size="sm" className="text-secondary-foreground opacity-80 font-medium text-base">
            You get 1GB of storage, used for your posts, photos, videos, and your profile.
          </Atoms.Typography>
        </Atoms.Container>

        <Atoms.Container className="gap-3 w-full flex-col mt-3">
          <Atoms.Container className="flex-col items-start gap-3 justify-start w-full">
            <Molecules.InputField
              value={inviteCode}
              variant="dashed"
              onClick={() => setInviteCode(inviteCode)}
              onChange={handleOnChange}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14}
              disabled={isLoading}
              status={status}
              className="w-full max-w-[576px]"
            />
          </Atoms.Container>
          <Atoms.Container className="flex-col md:flex-row gap-3 items-start md:items-center mt-3">
            <Atoms.Button variant={'secondary'} className="rounded-full" onClick={() => {}} disabled={true}>
              <Server className="mr-2 h-4 w-4" />
              Custom homeserver
            </Atoms.Button>
            <Atoms.Typography className="text-base-secondary-foreground text-base opacity-80 font-normal">
              Using a different homeserver will be possible soon.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Molecules.ContentCard>
      <Molecules.HomeserverFooter />
      <Molecules.HomeserverNavigation
        continueText={buttonContinueText}
        continueButtonDisabled={continueButtonDisabled}
        onHandleContinueButton={onHandleContinueButton}
      />
    </>
  );
}
