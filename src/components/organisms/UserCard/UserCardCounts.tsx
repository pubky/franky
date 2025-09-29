import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

export function UserCardCounts({ pubky }: { pubky: Core.Pubky }) {
  const userCounts = useLiveQuery(() => Core.db.user_counts.get(pubky), [pubky]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center text-xs text-muted-foreground">
        <span>TAGS</span>
        <span>{userCounts?.unique_tags || 0}</span>
      </div>
      <div className="flex flex-col items-center text-xs text-muted-foreground">
        <span>POSTS</span>
        <span>{userCounts?.posts || 0}</span>
      </div>
    </div>
  );
}
