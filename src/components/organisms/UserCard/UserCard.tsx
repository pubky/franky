'use client';

import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { useEffect, useState } from 'react';

type TUserCardProps = {
  pubky: Core.Pubky;
};

export function UserCard({ pubky }: TUserCardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        await Core.UserController.getUser(pubky);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pubky]);

  if (loading) return <Molecules.UserCardSkeleton />;

  return (
    <div className="flex items-center justify-between p-1 rounded-lg hover:bg-muted/50 transition-colors">
      <Organisms.UserCardDetails pubky={pubky} />
      <div className="flex items-center gap-4">
        <Organisms.UserCardTags pubky={pubky} />
        <Organisms.UserCardCounts pubky={pubky} />
        <Organisms.UserCardAction pubky={pubky} />
      </div>
    </div>
  );
}
