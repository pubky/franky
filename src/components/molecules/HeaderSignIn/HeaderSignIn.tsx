'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

export const HeaderSignIn = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { userDetails, currentUserPubky } = Hooks.useCurrentUserProfile();
  const unreadNotifications = Core.useNotificationStore((state) => state.selectUnread());

  const avatarInitial = Libs.extractInitials({ name: userDetails?.name || '' }) || 'U';

  return (
    <Atoms.Container className="flex-1 flex-row items-center justify-end gap-3" {...props}>
      <Organisms.SearchInput />
      <Molecules.HeaderNavigationButtons
        avatarImage={
          currentUserPubky ? Core.FileController.getAvatarUrl(currentUserPubky, userDetails?.indexed_at) : undefined
        }
        avatarInitial={avatarInitial}
        counter={unreadNotifications}
      />
    </Atoms.Container>
  );
};
