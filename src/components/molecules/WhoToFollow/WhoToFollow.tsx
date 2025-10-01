'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface WhoToFollowProps {
  className?: string;
}

export function WhoToFollow({ className }: WhoToFollowProps) {
  // Mock data with placeholder avatars
  const users = [
    { id: '1', name: 'Anna Pleb', pubky: '7SL4...98V5', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Carl Smith', pubky: '327F...2YM4', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: '3', name: 'Mi Lei', pubky: 'PL5Z...2JSL', avatar: 'https://i.pravatar.cc/150?img=5' },
  ];

  return (
    <div data-testid="who-to-follow" className={Libs.cn('flex flex-col gap-4', className)}>
      <h2 className="text-2xl font-light text-muted-foreground">Who to follow</h2>

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Atoms.Avatar className="h-12 w-12">
                <Atoms.AvatarImage src={user.avatar} alt={user.name} />
                <Atoms.AvatarFallback>{user.name[0]}</Atoms.AvatarFallback>
              </Atoms.Avatar>
              <div className="flex flex-col gap-0.5">
                <div className="text-base font-bold text-foreground">{user.name}</div>
                <div className="text-sm text-muted-foreground opacity-50">{user.pubky}</div>
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <Libs.UserPlus className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <button className="flex items-center gap-2 py-2 px-4 rounded-full border border-border hover:bg-secondary/10 transition-colors">
        <Libs.Users className="h-4 w-4" />
        <span className="text-sm font-medium">See all</span>
      </button>
    </div>
  );
}
