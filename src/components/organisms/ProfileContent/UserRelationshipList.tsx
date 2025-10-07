'use client';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import { useEffect, useState } from 'react';

type TUserRelationshipListProps = {
  pubky: Core.Pubky;
  relationshipType: Core.RelationshipType;
};

export function UserRelationshipList({ pubky, relationshipType }: TUserRelationshipListProps) {
  const [users, setUsers] = useState<Core.Pubky[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRelationship = async () => {
      try {
        setLoading(true);
        const userRelationships = await Core.UserController.getUsersByRelationship({ pubky, type: relationshipType });
        setUsers(userRelationships);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRelationship();
  }, [pubky, relationshipType]);

  if (loading) {
    return (
      <main className="flex-1 min-w-0">
        <Atoms.Container className="bg-background rounded-lg p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Molecules.UserCardSkeleton key={`skeleton-ucl-${index}`} />
            ))}
          </div>
        </Atoms.Container>
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0">
      <Atoms.Container className="bg-background rounded-lg p-6">
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center text-muted-foreground">No {relationshipType} found.</div>
          ) : (
            <div className="space-y-2">
              {users.map((pubky) => (
                <Organisms.UserCard key={`user_card_${pubky}`} pubky={pubky} />
              ))}
            </div>
          )}
        </div>
      </Atoms.Container>
    </main>
  );
}
