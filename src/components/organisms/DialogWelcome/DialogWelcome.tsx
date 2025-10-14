'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Core from '@/core';

/**
 * DialogWelcome
 *
 * Self-contained welcome dialog that manages its own state and data.
 * No props needed - it fetches user data and manages dialog state internally.
 */
export function DialogWelcome() {
  const { currentUserPubky } = Core.useAuthStore();
  const { showWelcomeDialog, setShowWelcomeDialog } = Core.useOnboardingStore();

  // Fetch current user details from database
  const userDetails = useLiveQuery(async () => {
    if (!currentUserPubky) return null;
    const details = await Core.ProfileController.read({ user_id: currentUserPubky });
    return details || null;
  }, [currentUserPubky]);

  const { copyToClipboard } = Hooks.useCopyToClipboard();

  // Don't render if conditions aren't met
  if (!userDetails || !currentUserPubky) {
    return null;
  }

  const displayPublicKey = Libs.formatPublicKey({ key: currentUserPubky, length: 10 });
  const initials = Libs.extractInitials({ name: userDetails.name, maxLength: 2 });
  const avatarImage = Core.filesApi.getAvatar(currentUserPubky);

  const handleCopyToClipboard = () => {
    copyToClipboard(currentUserPubky);
  };

  const handleExplorePubky = () => {
    // Set welcome dialog to false permanently - it will never show again for this user
    setShowWelcomeDialog(false);
  };

  return (
    <Atoms.Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
      <Atoms.DialogContent className="sm:max-w-xl" hiddenTitle="Welcome to Pubky!">
        <Atoms.DialogHeader className="text-left pr-6 gap-0 mb-6">
          <Atoms.DialogTitle id="welcome-title">Welcome to Pubky!</Atoms.DialogTitle>
          <Atoms.DialogDescription className="font-medium">
            Your keys, your content, your rules.
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="max-h-[420px] overflow-y-auto">
          <Atoms.Container className="flex flex-col gap-6">
            <Atoms.Card className="self-stretch p-6 bg-card rounded-lg flex flex-col sm:flex-row justify-center sm:justify-start items-center sm:items-start gap-6 overflow-hidden">
              <Atoms.Avatar className="w-24 h-24">
                <Atoms.AvatarImage src={avatarImage} />
                <Atoms.AvatarFallback className="text-4xl">{initials}</Atoms.AvatarFallback>
              </Atoms.Avatar>
              <Atoms.Container className="flex flex-col justify-center sm:justify-start items-center sm:items-start">
                <Atoms.Typography size="lg">{userDetails.name}</Atoms.Typography>
                <Atoms.Typography size="sm" className="text-center sm:text-left text-muted-foreground font-medium">
                  {userDetails.bio}
                </Atoms.Typography>
                <Atoms.Button
                  variant="secondary"
                  className="rounded-full gap-2 w-fit h-8 mt-2"
                  onClick={handleCopyToClipboard}
                >
                  <Libs.Key className="w-4 h-4" />
                  {displayPublicKey || '...'}
                </Atoms.Button>
              </Atoms.Container>
            </Atoms.Card>
            <Atoms.Button id="welcome-explore-pubky-btn" className="w-auto" size="lg" onClick={handleExplorePubky}>
              <Libs.ArrowRight className="mr-2 h-4 w-4" />
              Explore Pubky
            </Atoms.Button>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
