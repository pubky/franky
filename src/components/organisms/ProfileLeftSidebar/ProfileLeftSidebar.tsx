'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Templates from '@/templates';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

type NavigationItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number | string;
  section: Core.ProfileSection;
};

export const ProfileLeftSidebar = ({ pubkySlug }: Templates.TProfilePageProps) => {
  const userCounts = useLiveQuery(() => Core.db.user_counts.get(pubkySlug).then((user) => user), [pubkySlug]);
  const profileSection = Core.useProfileStore((state) => state.selectSection());

  const navigationItems: NavigationItem[] = userCounts
    ? [
        { label: 'Notifications', icon: Libs.Bell, count: 2, section: Core.ProfileSection.NOTIFICATIONS },
        { label: 'Posts', icon: Libs.FileText, count: userCounts.posts, section: Core.ProfileSection.POSTS },
        { label: 'Replies', icon: Libs.MessageSquare, count: userCounts.replies, section: Core.ProfileSection.REPLIES },
        { label: 'Followers', icon: Libs.Users, count: userCounts.followers, section: Core.ProfileSection.FOLLOWERS },
        {
          label: 'Following',
          icon: Libs.UserPlus,
          count: userCounts.following,
          section: Core.ProfileSection.FOLLOWING,
        },
        { label: 'Friends', icon: Libs.Heart, count: userCounts.friends, section: Core.ProfileSection.FRIENDS },
        { label: 'Tagged', icon: Libs.Tag, count: userCounts.unique_tags, section: Core.ProfileSection.TAGGED },
      ]
    : [];

  const renderSkeleton = () => (
    <aside className="w-52 flex-shrink-0">
      <Atoms.Container className="bg-background rounded-lg p-4">
        <nav className="space-y-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg">
              <div className="w-24 h-4 bg-muted rounded animate-pulse" />
              <div className="w-8 h-6 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </nav>
      </Atoms.Container>
    </aside>
  );

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    const IconComponent = item.icon;
    const isActive = profileSection === item.section;

    return (
      <div
        key={`lnb-${index}`}
        className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer"
        onClick={() => Core.useProfileStore.getState().setSection(item.section)}
      >
        <div className="flex items-center gap-3">
          <IconComponent className={`w-5 h-5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
          <span
            className={`text-sm ${isActive ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}
          >
            {item.label}
          </span>
        </div>
        <Atoms.Badge
          variant="secondary"
          className={`text-xs px-2 py-1 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
        >
          {item.count}
        </Atoms.Badge>
      </div>
    );
  };

  if (!userCounts) {
    return renderSkeleton();
  }

  return (
    <aside className="w-52 flex-shrink-0">
      <Atoms.Container className="bg-background rounded-lg p-4">
        <nav className="space-y-2">{navigationItems.map(renderNavigationItem)}</nav>
      </Atoms.Container>
    </aside>
  );
};
