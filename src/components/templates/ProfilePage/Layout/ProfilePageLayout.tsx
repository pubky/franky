'use client';

import { useState, useCallback } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { ProfileStats } from '@/hooks/useProfileHeader/useProfileHeader';
import { ProfilePageType, FilterBarPageType } from '@/app/profile/types';

export interface ProfilePageLayoutProps {
  /** Child pages to render in the main content area */
  children: React.ReactNode;
  /** Profile data from the smart container */
  profile: {
    name: string;
    bio: string;
    publicKey: string;
    emoji: string;
    status: string;
    avatarUrl?: string;
    link: string;
  };
  /** Statistics for the profile */
  stats: ProfileStats;
  /** Actions handlers for profile interactions */
  actions: {
    onEdit: () => void;
    onCopyPublicKey: () => void;
    onCopyLink: () => void;
    onSignOut: () => void;
    onStatusChange: (status: string) => void;
  };
  /** Currently active page */
  activePage: ProfilePageType;
  /** Active page for filter bar (excludes PROFILE page type) */
  filterBarActivePage: FilterBarPageType;
  /** Navigation handler */
  navigateToPage: (page: ProfilePageType) => void;
  /** Loading state */
  isLoading: boolean;
}

/**
 * ProfilePageLayout - Dumb presentation component for profile page structure
 *
 * This is a pure presentation component that receives all data and handlers as props.
 * It has no knowledge of:
 * - Authentication state
 * - Data fetching logic
 * - Business rules
 * - Routing details
 *
 * All intelligence is handled by ProfilePageContainer (the smart component).
 *
 * @example
 * ```tsx
 * <ProfilePageLayout
 *   profile={profileData}
 *   stats={statsData}
 *   actions={actionHandlers}
 *   activePage={activePage}
 *   filterBarActivePage={filterBarActivePage}
 *   navigateToPage={handleNavigate}
 *   isLoading={false}
 * >
 *   <ProfileContent />
 * </ProfilePageLayout>
 * ```
 */
export function ProfilePageLayout({
  children,
  profile,
  stats,
  actions,
  activePage,
  filterBarActivePage,
  navigateToPage,
  isLoading,
}: ProfilePageLayoutProps) {
  const [isAvatarZoomOpen, setIsAvatarZoomOpen] = useState(false);

  // Stabilize callbacks to prevent unnecessary re-renders in child components
  const handleAvatarClick = useCallback(() => {
    setIsAvatarZoomOpen(true);
  }, []);

  const handleCloseAvatarZoom = useCallback(() => {
    setIsAvatarZoomOpen(false);
  }, []);

  const headerActions = {
    ...actions,
    onAvatarClick: handleAvatarClick,
  };

  return (
    <>
      <Molecules.MobileHeader showLeftButton={false} showRightButton={false} />

      <Molecules.ProfilePageMobileMenu activePage={activePage} onPageChangeAction={navigateToPage} />

      <Molecules.ProfilePageLayoutWrapper>
        <Atoms.Container overrideDefaults={true} className="hidden bg-background pb-6 shadow-sm lg:block">
          {!isLoading && <Organisms.ProfilePageHeader profile={profile} actions={headerActions} />}
        </Atoms.Container>

        <Atoms.Container overrideDefaults={true} className="flex gap-6">
          <Molecules.ProfilePageFilterBar
            activePage={filterBarActivePage}
            onPageChangeAction={navigateToPage}
            stats={stats}
          />

          <Atoms.Container overrideDefaults={true} className="flex-1">
            {children}
          </Atoms.Container>
          <Molecules.ProfilePageSidebar />
        </Atoms.Container>
      </Molecules.ProfilePageLayoutWrapper>

      <Molecules.MobileFooter />

      <Molecules.AvatarZoomModal
        open={isAvatarZoomOpen}
        onClose={handleCloseAvatarZoom}
        avatarUrl={profile.avatarUrl}
        name={profile.name}
      />
    </>
  );
}
