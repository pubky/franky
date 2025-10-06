'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as App from '@/app';

export function HomeserverCard() {
  const router = useRouter();

  const { toast } = Molecules.useToast();

  const [inviteCode, setInviteCode] = useState('');
  const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'default' | 'success' | 'error'>('default');
  const { pubky, secretKey } = Core.useOnboardingStore();
  const [buttonContinueText, setButtonContinueText] = useState('Continue');

  // generate an invite code and put it in console log if you are in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      Core.AuthController.generateSignupToken().then((token) => {
        Libs.Logger.info(token, token);
      });
    }
  }, []);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = Libs.formatInviteCode(e.target.value);
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

  const isFormValid = () => {
    return !continueButtonDisabled && !isLoading;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid()) {
      e.preventDefault();
      onHandleContinueButton();
    }
  };

  const onHandleContinueButton = async () => {
    try {
      setContinueButtonDisabled(true);
      setStatus('default');
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
      setStatus('error');
      setButtonContinueText('Try again');
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
              id="invite-code-input"
              value={inviteCode}
              variant="dashed"
              onClick={() => setInviteCode(inviteCode)}
              onChange={handleOnChange}
              onKeyDown={handleKeyDown}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14}
              disabled={isLoading}
              status={status}
              className="w-full max-w-[576px]"
            />
          </Atoms.Container>
          <Atoms.Container className="flex-col md:flex-row gap-3 items-start md:items-center mt-3">
            <Atoms.Button variant={'secondary'} className="rounded-full" onClick={() => {}} disabled={true}>
              <Libs.Server className="mr-2 h-4 w-4" />
              Custom homeserver
            </Atoms.Button>
            <Atoms.Typography className="text-base-secondary-foreground text-base opacity-80 font-normal">
              Using a different homeserver will be possible soon.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Molecules.ContentCard>
      <Molecules.HomeserverFooter />
      <Atoms.Container className={Libs.cn('flex-row gap-3 lg:gap-6 justify-between py-6')}>
        <Atoms.Button
          size="lg"
          className="rounded-full flex-1 md:flex-0 w-full"
          variant={'secondary'}
          onClick={() => router.push(App.ONBOARDING_ROUTES.BACKUP)}
        >
          <Libs.ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Atoms.Button>
        <Atoms.Button
          id="continue-btn"
          size="lg"
          className="rounded-full flex-1 md:flex-0 w-full"
          onClick={onHandleContinueButton}
          disabled={continueButtonDisabled}
        >
          {isLoading ? (
            <>
              <Libs.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {buttonContinueText}
            </>
          ) : (
            <>
              <Libs.ArrowRight className="mr-2 h-4 w-4" />
              {buttonContinueText}
            </>
          )}
        </Atoms.Button>
      </Atoms.Container>
    </>
  );
}
