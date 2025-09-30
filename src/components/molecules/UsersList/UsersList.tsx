'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface UsersListProps {
  users: Atoms.UserData[];
  onFollow?: (userId: string) => void;
  onSeeAll?: () => void;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  title?: string;
  maxUsers?: number;
}

export function UsersList({ users, onFollow, onSeeAll, className, title, maxUsers = 3, ...props }: UsersListProps) {
  const displayUsers = users.slice(0, maxUsers);

  const handleFollow = (userId: string) => {
    onFollow?.(userId);
  };

  const handleSeeAll = () => {
    onSeeAll?.();
  };

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-2 bg-background', className)} {...props}>
      {title && (
        <Atoms.Heading level={2} size="lg" className={Libs.cn('text-muted-foreground font-light', className)}>
          {title}
        </Atoms.Heading>
      )}

      {/* Users List */}
      <Atoms.Container className="flex flex-col gap-2 justify-center items-center">
        {displayUsers.map((user) => (
          <Atoms.User
            key={user.id}
            user={user}
            onAction={onFollow ? handleFollow : undefined}
            showAction={!!onFollow}
            data-testid={`user-${user.id}`}
          />
        ))}
      </Atoms.Container>

      {/* See All Button */}
      {users.length > maxUsers && (
        <Atoms.Button
          variant="outline"
          onClick={handleSeeAll}
          className="w-full flex items-center justify-center gap-2"
          data-testid="see-all-button"
        >
          <Libs.Users className="w-4 h-4" />
          <Atoms.Typography size="sm" className="font-bold">
            See all
          </Atoms.Typography>
        </Atoms.Button>
      )}
    </Atoms.Container>
  );
}
