'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { AUTH_ROUTES } from '@/app';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

export function ProfilePage() {
  const router = useRouter();

  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  return (
    <Organisms.ContentLayout
      showLeftSidebar={false}
      showRightSidebar={false}
      showLeftMobileButton={false}
      showRightMobileButton={false}
    >
      <div className="flex items-center justify-between gap-4">
        <Atoms.Heading level={1} size="xl" className="text-2xl">
          Profile
        </Atoms.Heading>
        <Atoms.Button id="profile-logout-btn" variant="secondary" size="default" onClick={handleLogout}>
          Logout
        </Atoms.Button>
      </div>

      <Atoms.Typography size="md" className="text-muted-foreground">
        View and manage your profile information and activity.
      </Atoms.Typography>

      {/* Lorem ipsum content */}
      <div className="flex flex-col gap-4 mt-4">
        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Profile Information
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </Atoms.Typography>
        </Atoms.Card>

        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Recent Activity
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum.
          </Atoms.Typography>
        </Atoms.Card>

        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Your Posts
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
            aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </Atoms.Typography>
        </Atoms.Card>
      </div>
    </Organisms.ContentLayout>
  );
}
