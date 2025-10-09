'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ActiveUsersProps {
  className?: string;
}

export function ActiveUsers({ className }: ActiveUsersProps) {
  // Mock data with placeholder avatars
  const users = [
    { id: '1', name: 'David', postsCount: 42, tagsCount: 12, avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: '2', name: 'Emma', postsCount: 38, tagsCount: 8, avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: '3', name: 'Frank', postsCount: 35, tagsCount: 15, avatar: 'https://i.pravatar.cc/150?img=13' },
  ];

  return (
    <div data-testid="active-users" className={Libs.cn('flex flex-col gap-4', className)}>
      <h2 className="text-2xl font-light text-muted-foreground">Active Users</h2>

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Atoms.Avatar className="h-12 w-12">
              <Atoms.AvatarImage src={user.avatar} alt={user.name} />
              <Atoms.AvatarFallback>{user.name[0]}</Atoms.AvatarFallback>
            </Atoms.Avatar>
            <div className="flex flex-col gap-0.5">
              <div className="text-base font-bold text-foreground">{user.name}</div>
              <div className="text-sm text-muted-foreground opacity-50">
                {user.postsCount} posts • {user.tagsCount} tags
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-border hover:bg-secondary/10 transition-colors">
        <Libs.Users className="h-4 w-4" />
        <span className="text-sm font-medium">See All</span>
      </button>
    </div>
  );
}
