'use client';

import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Core from '@/core';
import { APP_ROUTES } from '@/app';

export function EditProfile() {
  const router = useRouter();
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const { pubky } = Core.useOnboardingStore();

  // Reset to column layout on mount
  Hooks.useLayoutReset();

  const displayPublicKey = Libs.formatPublicKey({ key: pubky, length: 10 });

  const handleCopyToClipboard = () => {
    copyToClipboard(pubky);
  };

  const handleBack = () => {
    router.push(APP_ROUTES.PROFILE);
  };

  return (
    <Atoms.Container
      size="container"
      className="min-h-dvh items-stretch gap-6 px-6 pb-6 pt-4 lg:gap-10 lg:min-h-0 lg:items-start"
    >
      <div data-testid="edit-profile-content" className="flex w-full flex-1 flex-col gap-6 lg:gap-10 lg:flex-none">
        {/* Header */}
        <Atoms.PageHeader>
          <div className="flex items-center gap-4">
            <Atoms.Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
              data-testid="edit-profile-back-btn"
            >
              <Libs.ArrowLeft className="w-5 h-5" />
            </Atoms.Button>
            <Atoms.Heading level={1} size="xl" className="text-2xl lg:text-3xl">
              Edit <span className="text-brand">profile</span>
            </Atoms.Heading>
          </div>
          <Atoms.Container className="flex-col md:flex-row md:items-center gap-4 w-auto m-0">
            <Atoms.Typography size="md" className="text-muted-foreground">
              Update your name, bio, links, and avatar.
            </Atoms.Typography>
            <Atoms.Container className="flex-row items-center gap-2 w-auto mx-0">
              <Atoms.Button
                variant="secondary"
                className="rounded-full gap-2 w-fit h-8"
                onClick={handleCopyToClipboard}
              >
                <Libs.Key className="w-4 h-4" />
                {displayPublicKey || '...'}
              </Atoms.Button>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.PageHeader>

        {/* Reuse CreateProfileForm - it handles all the form logic */}
        <Organisms.CreateProfileForm />
      </div>
    </Atoms.Container>
  );
}
