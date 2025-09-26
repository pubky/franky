'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Templates from '@/templates';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

export const ProfileLeftSidebar = ({ pubkySlug }: Templates.TProfilePageProps) => {
  const userCounts = useLiveQuery(() => Core.db.user_counts.get(pubkySlug).then((user) => user), [pubkySlug]);

  if (!userCounts) {
    return (
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
  }

  const { posts, replies, following, followers, friends, tagged } = userCounts;

  return (
    <aside className="w-52 flex-shrink-0">
      <Atoms.Container className="bg-background rounded-lg p-4">
        <nav className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.Bell className="w-5 h-5" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              2
            </Atoms.Badge>
          </div>

          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Posts</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              {posts}
            </Atoms.Badge>
          </div>

          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Replies</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              {replies}
            </Atoms.Badge>
          </div>

          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.Users className="w-5 h-5" />
              <span className="text-sm font-medium">Followers</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              {followers}
            </Atoms.Badge>
          </div>

          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.UserPlus className="w-5 h-5" />
              <span className="text-sm font-medium">Following</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              {following}
            </Atoms.Badge>
          </div>

          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Friends</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              {friends}
            </Atoms.Badge>
          </div>

          <div className="flex items-center justify-between py-2 px-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Libs.Tag className="w-5 h-5" />
              <span className="text-sm font-medium">Tagged</span>
            </div>
            <Atoms.Badge variant="secondary" className="text-xs px-2 py-1">
              {tagged}
            </Atoms.Badge>
          </div>
        </nav>
      </Atoms.Container>
    </aside>
  );
};
